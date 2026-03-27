// import api from "./api";

// const shiftService = {
//   getShifts: async () => {
//     const res = await api.get("/shifts"); // ✅ bas ye hi
//     return res.data;
//   },

//   createShift: async (data) => {
//     const res = await api.post("/shifts", data);
//     return res.data;
//   },
// };

// export default shiftService;

import api from "./api";

const shiftService = {
  getShifts: async () => {
    try {
      const res = await api.get("/shifts");
      return res.data;
    } catch (error) {
      console.error("Error fetching shifts:", error);
      throw error;
    }
  },

  createShift: async (data) => {
    try {
      const res = await api.post("/shifts", data);
      return res.data;
    } catch (error) {
      console.error("Error creating shift:", error);
      throw error;
    }
  },
};

export default shiftService;