import {
  BookmarkOutline,
  AlbumsOutline,
  PeopleOutline,
} from "@vicons/ionicons5";
import { NIcon, type MenuOption } from "naive-ui";
import { type Component, h } from "vue";

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const userOptions: MenuOption[] = [
  {
    label: "授权纪录",
    key: "authorized",
    icon: renderIcon(BookmarkOutline),
  },
  {
    label: "个人信息",
    key: "profile",
    icon: renderIcon(PeopleOutline),
  },
];

const developerOptions: MenuOption[] = [
  {
    label: "应用列表",
    key: "applications",
    icon: renderIcon(AlbumsOutline),
  },
];

export { userOptions, developerOptions };
