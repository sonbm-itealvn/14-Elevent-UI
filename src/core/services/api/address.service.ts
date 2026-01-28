export interface Province {
  code: string;
  name: string;
  nameEn: string;
  fullName: string;
  fullNameEn: string;
  codeName: string;
}

export interface District {
  code: string;
  name: string;
  nameEn: string;
  fullName: string;
  fullNameEn: string;
  codeName: string;
  provinceCode: string;
}

export interface Ward {
  code: string;
  name: string;
  nameEn: string;
  fullName: string;
  fullNameEn: string;
  codeName: string;
  districtCode: string;
}

class AddressService {
  private readonly API_BASE_URL = "https://provinces.open-api.vn/api";

  /**
   * Lấy danh sách tất cả tỉnh/thành phố
   */
  async getProvinces(): Promise<Province[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/p/`);
      if (!response.ok) {
        throw new Error("Failed to fetch provinces");
      }
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error("Error fetching provinces:", error);
      // Fallback: trả về danh sách tỉnh/thành phố phổ biến
      return this.getFallbackProvinces();
    }
  }

  /**
   * Lấy danh sách quận/huyện theo mã tỉnh/thành phố
   */
  async getDistrictsByProvince(provinceCode: string): Promise<District[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/p/${provinceCode}?depth=2`);
      if (!response.ok) {
        throw new Error("Failed to fetch districts");
      }
      const province = await response.json();
      return province?.districts || [];
    } catch (error) {
      console.error("Error fetching districts:", error);
      return [];
    }
  }

  /**
   * Lấy danh sách phường/xã theo mã quận/huyện
   */
  async getWardsByDistrict(districtCode: string): Promise<Ward[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/d/${districtCode}?depth=2`);
      if (!response.ok) {
        throw new Error("Failed to fetch wards");
      }
      const district = await response.json();
      return district?.wards || [];
    } catch (error) {
      console.error("Error fetching wards:", error);
      return [];
    }
  }

  /**
   * Fallback: Danh sách tỉnh/thành phố phổ biến nếu API không hoạt động
   */
  private getFallbackProvinces(): Province[] {
    return [
      { code: "01", name: "Hà Nội", nameEn: "Ha Noi", fullName: "Thành phố Hà Nội", fullNameEn: "Ha Noi City", codeName: "ha_noi" },
      { code: "79", name: "Hồ Chí Minh", nameEn: "Ho Chi Minh", fullName: "Thành phố Hồ Chí Minh", fullNameEn: "Ho Chi Minh City", codeName: "ho_chi_minh" },
      { code: "31", name: "Hải Phòng", nameEn: "Hai Phong", fullName: "Thành phố Hải Phòng", fullNameEn: "Hai Phong City", codeName: "hai_phong" },
      { code: "48", name: "Đà Nẵng", nameEn: "Da Nang", fullName: "Thành phố Đà Nẵng", fullNameEn: "Da Nang City", codeName: "da_nang" },
      { code: "92", name: "Cần Thơ", nameEn: "Can Tho", fullName: "Thành phố Cần Thơ", fullNameEn: "Can Tho City", codeName: "can_tho" },
      { code: "30", name: "Hải Dương", nameEn: "Hai Duong", fullName: "Tỉnh Hải Dương", fullNameEn: "Hai Duong Province", codeName: "hai_duong" },
      { code: "36", name: "Hưng Yên", nameEn: "Hung Yen", fullName: "Tỉnh Hưng Yên", fullNameEn: "Hung Yen Province", codeName: "hung_yen" },
      { code: "35", name: "Hà Nam", nameEn: "Ha Nam", fullName: "Tỉnh Hà Nam", fullNameEn: "Ha Nam Province", codeName: "ha_nam" },
      { code: "34", name: "Nam Định", nameEn: "Nam Dinh", fullName: "Tỉnh Nam Định", fullNameEn: "Nam Dinh Province", codeName: "nam_dinh" },
      { code: "33", name: "Thái Bình", nameEn: "Thai Binh", fullName: "Tỉnh Thái Bình", fullNameEn: "Thai Binh Province", codeName: "thai_binh" },
      { code: "38", name: "Vĩnh Phúc", nameEn: "Vinh Phuc", fullName: "Tỉnh Vĩnh Phúc", fullNameEn: "Vinh Phuc Province", codeName: "vinh_phuc" },
      { code: "27", name: "Bắc Ninh", nameEn: "Bac Ninh", fullName: "Tỉnh Bắc Ninh", fullNameEn: "Bac Ninh Province", codeName: "bac_ninh" },
      { code: "24", name: "Bắc Giang", nameEn: "Bac Giang", fullName: "Tỉnh Bắc Giang", fullNameEn: "Bac Giang Province", codeName: "bac_giang" },
      { code: "15", name: "Lào Cai", nameEn: "Lao Cai", fullName: "Tỉnh Lào Cai", fullNameEn: "Lao Cai Province", codeName: "lao_cai" },
      { code: "02", name: "Hà Giang", nameEn: "Ha Giang", fullName: "Tỉnh Hà Giang", fullNameEn: "Ha Giang Province", codeName: "ha_giang" },
    ];
  }
}

export default new AddressService();

