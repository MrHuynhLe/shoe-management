import { useState } from "react";

const UserPage = () => {

  const [openDetail, setOpenDetail] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);

  return (
    <div>User Page</div>
  );
};

export default UserPage;