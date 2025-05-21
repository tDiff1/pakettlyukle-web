import axios from "axios";
import qs from "qs";

interface GetDepositResult {
  ResponseCode: string;
  Message_TR: string;
  Message_EN: string;
  Deposit: string;
  HostDateTime: string;
}

interface GetDepositRequest {
  Operation: string;
  request: {
    DealerCode: string;
    Username: string;
    Password: string;
  };
}

interface Company {
  CompanyCode: string;
  Name: string;
  QueryInfoText: string;
  QueryField: QueryField[];
}

interface QueryField {
  FieldName: string;
  FieldType: string;
  Required: number;
  MaxLength: string;
  MinLength: string;
}

interface CompanyListResult {
  ResponseCode: string;
  Message_TR: string;
  Message_EN: string;
  HostDateTime: string;
  Count: number;
  CompanyList: Company[];
}

interface CompanyListRequest {
  Operation: string;
  request: {
    DealerCode: string;
    Username: string;
    Password: string;
  };
}

// Artık kullanılmıyor: interface ApiResponse<T> {
//   [key: string]: T;
// }

async function fetchDeposit(): Promise<{ result: GetDepositResult | null; error: string | null }> {
  const data: GetDepositRequest = {
    Operation: "GetDeposit",
    request: {
      DealerCode: "105",
      Username: "5348754343",
      Password: "1020305070",
    },
  };

  try {
    // Generic tipi doğrudan beklenen yapıya göre tanımlıyoruz.
    const response = await axios.post<{ GetDepositResult: GetDepositResult }>(
      "http://bayi.apikontor.com/ClientWebService",
      qs.stringify(data, { encode: false }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.data.GetDepositResult.ResponseCode === "0000") {
      return { result: response.data.GetDepositResult, error: null };
    } else {
      return {
        result: null,
        error: response.data.GetDepositResult.Message_TR || "Bilinmeyen bir hata oluştu.",
      };
    }
  } catch (error: unknown) {
    return { result: null, error: axios.isAxiosError(error) ? error.message : "Beklenmeyen bir hata oluştu." };
  }
}

async function fetchCompanyList(): Promise<{ result: Company[] | null; error: string | null }> {
  const data: CompanyListRequest = {
    Operation: "CompanyList",
    request: {
      DealerCode: "105",
      Username: "5348754343",
      Password: "1020305070",
    },
  };

  try {
    // CompanyList için de benzer şekilde tip belirtiyoruz.
    const response = await axios.post<{ CompanyListResult: CompanyListResult }>(
      "http://bayi.apikontor.com/ClientWebService",
      qs.stringify(data, { encode: false }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.data.CompanyListResult.ResponseCode === "0000") {
      const filteredCompanies = response.data.CompanyListResult.CompanyList.filter((company: Company) =>
        company.QueryField.some((field: QueryField) => field.FieldName === "Telefon Numarası")
      );

      return { result: filteredCompanies, error: null };
    } else {
      return {
        result: null,
        error: response.data.CompanyListResult.Message_TR || "Bilinmeyen bir hata oluştu.",
      };
    }
  } catch (error: unknown) {
    return { result: null, error: axios.isAxiosError(error) ? error.message : "Beklenmeyen bir hata oluştu." };
  }
}

export default async function DepositPage() {
  const { result: depositResult, error: depositError } = await fetchDeposit();
  const { result: companyList, error: companyError } = await fetchCompanyList();

  return (
    <div>
      <h1>Hesap Bakiyesi</h1>
      {depositError ? (
        <p>Hata: {depositError}</p>
      ) : (
        depositResult && (
          <div>
            <p><strong>Sonuç Kodu:</strong> {depositResult.ResponseCode}</p>
            <p><strong>Bakiye:</strong> {depositResult.Deposit} TL</p>
          </div>
        )
      )}
      
      <h2>Telefon Numarası İçeren Kurumlar</h2>
      {companyError ? (
        <p>Hata: {companyError}</p>
      ) : (
        companyList && companyList.length > 0 ? (
          <ul>
            {companyList.map((company: Company) => (
              <li key={company.CompanyCode}>
                <strong>{company.Name}</strong> {company.CompanyCode}
              </li>
            ))}
          </ul>
        ) : (
          <p>Telefon Numarası alanı içeren kurum bulunamadı.</p>
        )
      )}
    </div>
  );
}
