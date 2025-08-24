import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllCourse, getDetailsCourse } from "../../services/CourseService";

// Gọi API danh sách khóa học
export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllCourse();
      return res.data; // tùy vào API, nếu là res.data.data thì sửa lại
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi không xác định");
    }
  }
);

// Gọi API chi tiết khóa học
export const fetchCourseDetails = createAsyncThunk(
  "courses/fetchCourseDetails",
  async (courseId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access-token");
      const res = await getDetailsCourse(courseId, token);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Không thể lấy chi tiết");
    }
  }
);

const courseSlice = createSlice({
  name: "courses",
  initialState: {
    courseList: [],
    courseDetails: null,
    search: "",
    status: "idle",
    error: null,
  },
  reducers: {
    searchCourse(state, action) {
      state.search = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH COURSES
      .addCase(fetchCourses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.courseList = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // FETCH COURSE DETAILS
      .addCase(fetchCourseDetails.fulfilled, (state, action) => {
        state.courseDetails = action.payload;
      });
  },
});

export const { searchCourse } = courseSlice.actions;
export default courseSlice.reducer;
