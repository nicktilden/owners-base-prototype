/**
 * OBSERVATION TYPES
 */

export type ObservationType =
  | 'Commissioning'
  | 'Environmental - Asbestos'
  | 'Environmental - Other'
  | 'Environmental - Spill'
  | 'Environmental - Storm Water'
  | 'Environmental - Vegetation'
  | 'Environmental - Waste Management'
  | 'Safety - Near Miss'
  | 'Safety - Safety Hazard'
  | 'Safety - Safety Notice'
  | 'Safety - Safety Violation'
  | 'Warranty - Service Call'
  | 'Work to Complete';

export type ObservationStatus =
  | 'Initiated'
  | 'Ready for Review'
  | 'Not Accepted'
  | 'Closed';

export type ObservationPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ObservationTrade =
  | 'Appliances'
  | 'Architect'
  | 'Civil'
  | 'Cabinetry'
  | 'Communications'
  | 'Concrete'
  | 'Construction Cleaning'
  | 'Consultant'
  | 'Demo'
  | 'De-Watering'
  | 'Doors & Hardware'
  | 'Drywall'
  | 'Earthwork'
  | 'Electrical'
  | 'Elevators'
  | 'Escalators'
  | 'Finish Carpentry'
  | 'Fire Alarm'
  | 'Fire Sprinklers'
  | 'Flooring'
  | 'Glazing'
  | 'Insulation'
  | 'Landscaping'
  | 'Lifts'
  | 'Masonry'
  | 'Mechanical'
  | 'Metal Panels'
  | 'Metal Stud Framing'
  | 'Painting'
  | 'Pavement Markings'
  | 'Plumbing'
  | 'Roofing'
  | 'Rough Carpentry'
  | 'Sealants'
  | 'Security'
  | 'Shoring'
  | 'Signage'
  | 'Storefront'
  | 'Structural'
  | 'Structural & Misc. Metals'
  | 'Stucco'
  | 'Temporary Fencing'
  | 'Temporary Services'
  | 'Utilities'
  | 'Window';

export type ObservationHazard =
  | 'Caught In / Between'
  | 'Chemical'
  | 'Electrical'
  | 'Environmental'
  | 'Ergonomic'
  | 'Exposure'
  | 'Fall'
  | 'Heat / Fire / Explosion'
  | 'Impalement'
  | 'Overexertion'
  | 'Radiation'
  | 'Respiratory'
  | 'Slip'
  | 'Struck by'
  | 'Trip'
  | 'Violence';

export type ObservationContributingBehavior =
  | 'Authorization'
  | 'Communication'
  | 'Distraction'
  | 'Horseplay'
  | 'Lock Out / Tag Out'
  | 'Methods / Procedures / Rules'
  | 'Misconduct'
  | 'Planning'
  | 'Position / Posture'
  | 'PPE'
  | 'Speed / Distance'
  | 'Stress'
  | 'Supervision'
  | 'Training';

export type ObservationContributingCondition =
  | 'Access / Egress'
  | 'Clothing'
  | 'Environment'
  | 'Equipment'
  | 'Ergonomics'
  | 'Ground Conditions'
  | 'Guard / Barrier'
  | 'Housekeeping'
  | 'Information / Signage'
  | 'Lighting'
  | 'Material Selection'
  | 'Noise'
  | 'PPE'
  | 'Security'
  | 'Shoring / Bracing'
  | 'Stored Energy'
  | 'Tool'
  | 'Traffic Controls'
  | 'Ventilation'
  | 'Weather'
  | 'Workstation Layout';

export interface Observation {
  id: string;
  accountId: string;
  projectId: string;

  number: number;
  title: string;
  type: ObservationType;
  status: ObservationStatus;
  priority: ObservationPriority;

  // Assignment
  trade: ObservationTrade;
  assigneeId: string | null;         // user ID
  dueDate: string | null;            // ISO date

  // Location & context
  location: string | null;
  specsSection: string | null;       // e.g. "033000 - Cast-In-Place Concrete"

  // Privacy & access
  private: boolean;
  distribution: string[];            // array of user IDs

  // Safety classification
  hazard: ObservationHazard | null;
  contributingBehaviors: ObservationContributingBehavior[];
  contributingConditions: ObservationContributingCondition[];

  // Linked records
  drawingIds: string[];              // linked drawing IDs

  // Content
  description: string;

  // Metadata (auto-populated)
  createdBy: string;                 // user ID
  createdAt: Date;
  updatedAt: Date;
}
