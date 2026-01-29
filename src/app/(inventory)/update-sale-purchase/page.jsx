export const revalidate = 0;
import SalePurchasePage from "@/components/Sales/SaleManagement/SalePurchasePage";
import client_api from "@/utils/API_FETCH";

const page = async ({ searchParams }) => {
  let searchParms = await searchParams;

  const getData = await client_api.get(
    `${process.env.BASE_URL}/api/update-sale-purchase?id=${
      searchParms?.id
    }&type=${searchParms?.type === "Sale" ? "sale" : "purchase"}&partyId=${
      searchParms?.partyId
    }`
  );

  if (!getData?.status) {
    return <p>Someting went wrong!</p>;
  }

  return (
    <div>
      <SalePurchasePage
        mode="update"
        type={searchParms?.type === "Sale" ? "sale" : "purchase"}
        initData={{
          data: getData?.data,
          invoiceData: getData?.invoiceData,
          party: getData?.party,
        }}
      />
    </div>
  );
};

export default page;
