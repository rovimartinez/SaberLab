import { onRequestPost as __api_admin_courses_js_onRequestPost } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\admin\\courses.js"
import { onRequestGet as __api_admin_plataforma_js_onRequestGet } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\admin\\plataforma.js"
import { onRequestGet as __api_auth_callback_js_onRequestGet } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\auth\\callback.js"
import { onRequestGet as __api_auth_me_js_onRequestGet } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\auth\\me.js"
import { onRequestGet as __api_auth_start_js_onRequestGet } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\auth\\start.js"
import { onRequestGet as __api_achievements_js_onRequestGet } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\achievements.js"
import { onRequestGet as __api_attempts_js_onRequestGet } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\attempts.js"
import { onRequestPost as __api_attempts_js_onRequestPost } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\attempts.js"
import { onRequestDelete as __api_codes_js_onRequestDelete } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\codes.js"
import { onRequestGet as __api_codes_js_onRequestGet } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\codes.js"
import { onRequestPost as __api_codes_js_onRequestPost } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\codes.js"
import { onRequestDelete as __api_evaluations_js_onRequestDelete } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\evaluations.js"
import { onRequestGet as __api_evaluations_js_onRequestGet } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\evaluations.js"
import { onRequestPost as __api_evaluations_js_onRequestPost } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\evaluations.js"
import { onRequestDelete as __api_groups_js_onRequestDelete } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\groups.js"
import { onRequestGet as __api_groups_js_onRequestGet } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\groups.js"
import { onRequestPatch as __api_groups_js_onRequestPatch } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\groups.js"
import { onRequestPost as __api_groups_js_onRequestPost } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\groups.js"
import { onRequestGet as __api_lesson_progress_js_onRequestGet } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\lesson-progress.js"
import { onRequestPost as __api_lesson_progress_js_onRequestPost } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\lesson-progress.js"
import { onRequestDelete as __api_notifications_js_onRequestDelete } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\notifications.js"
import { onRequestGet as __api_notifications_js_onRequestGet } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\notifications.js"
import { onRequestPost as __api_notifications_js_onRequestPost } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\notifications.js"
import { onRequestGet as __api_profile_js_onRequestGet } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\profile.js"
import { onRequestGet as __api_progress_js_onRequestGet } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\progress.js"
import { onRequestPost as __api_progress_js_onRequestPost } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\progress.js"
import { onRequestGet as __api_requests_js_onRequestGet } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\requests.js"
import { onRequestPatch as __api_requests_js_onRequestPatch } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\requests.js"
import { onRequestPost as __api_requests_js_onRequestPost } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\requests.js"
import { onRequestGet as __api_visibility_js_onRequestGet } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\visibility.js"
import { onRequestPost as __api_visibility_js_onRequestPost } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\visibility.js"
import { onRequest as __api__middleware_js_onRequest } from "C:\\Users\\Elizabeth\\Desktop\\SaberLab\\functions\\api\\_middleware.js"

export const routes = [
    {
      routePath: "/api/admin/courses",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_courses_js_onRequestPost],
    },
  {
      routePath: "/api/admin/plataforma",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_plataforma_js_onRequestGet],
    },
  {
      routePath: "/api/auth/callback",
      mountPath: "/api/auth",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_callback_js_onRequestGet],
    },
  {
      routePath: "/api/auth/me",
      mountPath: "/api/auth",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_me_js_onRequestGet],
    },
  {
      routePath: "/api/auth/start",
      mountPath: "/api/auth",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_start_js_onRequestGet],
    },
  {
      routePath: "/api/achievements",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_achievements_js_onRequestGet],
    },
  {
      routePath: "/api/attempts",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_attempts_js_onRequestGet],
    },
  {
      routePath: "/api/attempts",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_attempts_js_onRequestPost],
    },
  {
      routePath: "/api/codes",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_codes_js_onRequestDelete],
    },
  {
      routePath: "/api/codes",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_codes_js_onRequestGet],
    },
  {
      routePath: "/api/codes",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_codes_js_onRequestPost],
    },
  {
      routePath: "/api/evaluations",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_evaluations_js_onRequestDelete],
    },
  {
      routePath: "/api/evaluations",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_evaluations_js_onRequestGet],
    },
  {
      routePath: "/api/evaluations",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_evaluations_js_onRequestPost],
    },
  {
      routePath: "/api/groups",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_groups_js_onRequestDelete],
    },
  {
      routePath: "/api/groups",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_groups_js_onRequestGet],
    },
  {
      routePath: "/api/groups",
      mountPath: "/api",
      method: "PATCH",
      middlewares: [],
      modules: [__api_groups_js_onRequestPatch],
    },
  {
      routePath: "/api/groups",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_groups_js_onRequestPost],
    },
  {
      routePath: "/api/lesson-progress",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_lesson_progress_js_onRequestGet],
    },
  {
      routePath: "/api/lesson-progress",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_lesson_progress_js_onRequestPost],
    },
  {
      routePath: "/api/notifications",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_notifications_js_onRequestDelete],
    },
  {
      routePath: "/api/notifications",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_notifications_js_onRequestGet],
    },
  {
      routePath: "/api/notifications",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_notifications_js_onRequestPost],
    },
  {
      routePath: "/api/profile",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_profile_js_onRequestGet],
    },
  {
      routePath: "/api/progress",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_progress_js_onRequestGet],
    },
  {
      routePath: "/api/progress",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_progress_js_onRequestPost],
    },
  {
      routePath: "/api/requests",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_requests_js_onRequestGet],
    },
  {
      routePath: "/api/requests",
      mountPath: "/api",
      method: "PATCH",
      middlewares: [],
      modules: [__api_requests_js_onRequestPatch],
    },
  {
      routePath: "/api/requests",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_requests_js_onRequestPost],
    },
  {
      routePath: "/api/visibility",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_visibility_js_onRequestGet],
    },
  {
      routePath: "/api/visibility",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_visibility_js_onRequestPost],
    },
  {
      routePath: "/api",
      mountPath: "/api",
      method: "",
      middlewares: [__api__middleware_js_onRequest],
      modules: [],
    },
  ]