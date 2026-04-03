/**
 * PROJECT PICKER POPOVER
 * Flyout search + list for switching between portfolio and project level.
 * Reads projects from DataContext. Switching a project sets LevelContext.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Search, Typography } from '@procore/core-react';
import styled from 'styled-components';
import { useData } from '@/context/DataContext';
import { useLevel } from '@/context/LevelContext';
import { usePersona } from '@/context/PersonaContext';
import { hasPermissionKey } from '@/utils/permissions';
import { sampleProjectRows } from '@/data/projects';
import {
  favoriteKeyForSampleProject,
  favoriteKeyForSeedProject,
  getFavorite,
  readProjectFavorites,
  type ProjectFavoriteMap,
} from '@/utils/projectFavorites';

const Popover = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 320px;
  background: #fff;
  border-radius: 0 0 8px 8px;
  box-shadow: 0px 4px 28px 0px rgba(0, 0, 0, 0.28);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1300;
`;

const SearchWrap = styled.div`
  padding: 16px 16px 8px;
  flex-shrink: 0;
`;

const MenuScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  max-height: 280px;
  padding: 8px 0;
`;

const SectionLabel = styled.div`
  padding: 4px 16px;
`;

const ProjectRow = styled.button`
  display: block;
  width: 100%;
  padding: 4px 18px;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s;
  &:hover { background: #f4f5f6; }
`;

const Divider = styled.div`
  height: 1px;
  background: #d6dadc;
  flex-shrink: 0;
`;

const Footer = styled.div`
  padding: 12px 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CompanyInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const PortfolioRow = styled.button`
  display: block;
  width: 100%;
  padding: 4px 18px;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s;
  &:hover { background: #f4f5f6; }
`;

interface ProjectPickerPopoverProps {
  anchorRef: React.RefObject<HTMLElement>;
  onClose: () => void;
}

export default function ProjectPickerPopover({ anchorRef, onClose }: ProjectPickerPopoverProps) {
  const router = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [favoriteMap, setFavoriteMap] = useState<ProjectFavoriteMap>({});
  const { data } = useData();
  const { setProject, clearProject } = useLevel();
  const { activeUser } = usePersona();

  // Filter projects visible to the active user
  const visibleProjects = data.projects.filter((p) => {
    if (!activeUser) return true;
    // Portfolio-level users (no project restriction) see all
    if (activeUser.projectIds.length === 0) return true;
    return activeUser.projectIds.includes(p.id);
  });

  const filtered = query.trim()
    ? visibleProjects.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.number.toLowerCase().includes(query.toLowerCase())
      )
    : visibleProjects;

  const favorites = filtered.filter((p) =>
    getFavorite(favoriteMap, favoriteKeyForSeedProject(p.id), p.favorite)
  );
  const sampleFavorites = sampleProjectRows.filter((p) =>
    getFavorite(favoriteMap, favoriteKeyForSampleProject(p.id), p.favorite)
  );
  const isFiltering = query.trim().length > 0;

  useEffect(() => {
    setFavoriteMap(readProjectFavorites());
    const onStorage = () => setFavoriteMap(readProjectFavorites());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [anchorRef, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    router.events.on('routeChangeStart', onClose);
    return () => router.events.off('routeChangeStart', onClose);
  }, [router.events, onClose]);

  const goToPortfolio = () => {
    clearProject();
    router.push('/portfolio');
    onClose();
  };

  const goToProject = (id: string) => {
    setProject(id);
    router.push(`/project/${id}`);
    onClose();
  };
  const goToSampleProject = (id: number) => {
    clearProject();
    router.push(`/project/${id}`);
    onClose();
  };

  const account = data.account;

  return (
    <Popover ref={popoverRef} role="dialog" aria-label="Select project">
      <SearchWrap>
        <Search
          placeholder="Search portfolio..."
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
          autoFocus
        />
      </SearchWrap>

      <MenuScroll>
        {/* Portfolio level shortcut */}
        {!isFiltering && (
          <>
            <SectionLabel>
              <Typography intent="body" style={{ fontWeight: 600 }}>Portfolio</Typography>
            </SectionLabel>
            <PortfolioRow onClick={goToPortfolio}>
              <Typography intent="body">All Projects</Typography>
            </PortfolioRow>
          </>
        )}

        {/* Favorite projects */}
        {!isFiltering && (
          <>
            <SectionLabel style={{ marginTop: 4 }}>
              <Typography intent="body" style={{ fontWeight: 600 }}>Favorites</Typography>
            </SectionLabel>
            {favorites.length === 0 && sampleFavorites.length === 0 ? (
              <SectionLabel>
                <Typography intent="body" style={{ color: "#6A767C" }}>
                  No projects
                </Typography>
              </SectionLabel>
            ) : (
              <>
                {favorites.map((p) => (
                  <ProjectRow key={p.id} onClick={() => goToProject(p.id)}>
                    <Typography intent="body">{p.number} — {p.name}</Typography>
                  </ProjectRow>
                ))}
                {sampleFavorites.map((p) => (
                  <ProjectRow key={`sample-${p.id}`} onClick={() => goToSampleProject(p.id)}>
                    <Typography intent="body">{p.number} — {p.name}</Typography>
                  </ProjectRow>
                ))}
              </>
            )}
          </>
        )}

        {/* All / filtered projects */}
        {(isFiltering || visibleProjects.length > 0) && (
          <>
            {!isFiltering && (
              <SectionLabel style={{ marginTop: 4 }}>
                <Typography intent="body" style={{ fontWeight: 600 }}>All Projects</Typography>
              </SectionLabel>
            )}
            {filtered.length === 0 ? (
              <SectionLabel>
                <Typography intent="body" style={{ color: "#6A767C" }}>
                  No projects
                </Typography>
              </SectionLabel>
            ) : (
              filtered.map((p) => (
                <ProjectRow key={`all-${p.id}`} onClick={() => goToProject(p.id)}>
                  <Typography intent="body">{p.number} — {p.name}</Typography>
                </ProjectRow>
              ))
            )}
          </>
        )}

        {!isFiltering && visibleProjects.length === 0 && (
          <SectionLabel>
            <Typography intent="body" style={{ color: '#6b7177' }}>
              No projects available
            </Typography>
          </SectionLabel>
        )}
      </MenuScroll>

      <Divider />

      <Footer>
        <CompanyInfo>
          <Typography intent="small" style={{ color: '#232729' }}>Current Company</Typography>
          <Typography intent="body" style={{
            fontWeight: 600, color: '#232729',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {account?.companyName ?? 'Acme Development Group'}
          </Typography>
        </CompanyInfo>
        {activeUser && hasPermissionKey(activeUser, 'account:update') && (
          <Button variant="secondary" size="sm">Change</Button>
        )}
      </Footer>
    </Popover>
  );
}
