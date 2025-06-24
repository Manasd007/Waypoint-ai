import Collaborator from "@/components/settings/Collaborator";
import { FC } from "react";

interface PageProps {
  params: {
    planId: string;
  };
}

const CollaboratePage: FC<PageProps> = ({ params }) => {
  // planId is available here if needed in the future
  return <Collaborator />;
};

export default CollaboratePage;
