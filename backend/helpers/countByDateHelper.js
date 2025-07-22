export const countTodayAndYesterday = async (Model, filter = {}) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
  
    const todayCount = await Model.countDocuments({
      ...filter,
      createdAt: { $gte: today },
    });
  
    const yesterdayCount = await Model.countDocuments({
      ...filter,
      createdAt: { $gte: yesterday, $lt: today },
    });
  
    return { today: todayCount, yesterday: yesterdayCount };
  };
  