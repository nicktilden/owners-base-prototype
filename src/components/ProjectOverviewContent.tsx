import Head from "next/head";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { Button, DetailPage, H1, Title } from "@procore/core-react";
import { Home, Plus } from "@procore/core-icons";

const GlobalHeader = dynamic(() => import("@/components/nav/GlobalHeader"), { ssr: false });
const AppLayout = dynamic(() => import("@/components/nav/AppLayout"), { ssr: false });

export default function ProjectOverviewContent() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>Project Overview — Owner Prototype</title>
      </Head>
      <GlobalHeader />
      <AppLayout>
        <DetailPage width="lg">
          <DetailPage.Main>
            <DetailPage.Header>
              <DetailPage.Title>
                <Title>
                  <Title.Text>
                    <H1 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Home size="md" />
                      Project Overview
                    </H1>
                  </Title.Text>
                  <Title.Actions>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button variant="primary" icon={<Plus />}>
                        Add Update
                      </Button>
                      <Button variant="secondary">Export</Button>
                    </div>
                  </Title.Actions>
                </Title>
              </DetailPage.Title>
            </DetailPage.Header>
            <DetailPage.Body>
              <div style={{ paddingTop: 8 }}>
                <p>Project ID: {id}</p>
                <p>Step 12: Project hub coming next.</p>
              </div>
            </DetailPage.Body>
          </DetailPage.Main>
        </DetailPage>
      </AppLayout>
    </>
  );
}
