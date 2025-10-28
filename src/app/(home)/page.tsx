import { getCategories } from "@/actions/video/get-categories";
import { FilterCarousel } from "@/components/filter-carousel";
import { HomeVideoList } from "@/modules/home/home-video-list";

export default async function HomePage() {
  const categories = await getCategories();

  if (!categories?.length) {
    return <p>没有分类数据</p>;
  }

  const categoriesData = categories.map(c => ({
    value: String(c.id),
    label: c.name,
  }));

  return (
    <div className="flex flex-col pt-3 px-4">
      <FilterCarousel data={categoriesData}/>
      <HomeVideoList/>
    </div>
  );
}