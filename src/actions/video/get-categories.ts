'use server'

export async function getCategories() {
  return [
    { id: 'cat_music', name: '音乐' },
    { id: 'cat_gaming', name: '游戏' },
    { id: 'cat_education', name: '教育' },
    { id: 'cat_news', name: '新闻' },
    { id: 'cat_sports', name: '体育' },
    { id: 'cat_entertainment', name: '娱乐' },
    { id: 'cat_science', name: '科学与技术' },
    { id: 'cat_travel', name: '旅游' },
    { id: 'cat_food', name: '美食' },
    { id: 'cat_film', name: '影视与动画' }
  ];
  // return prisma.category.findMany();
}