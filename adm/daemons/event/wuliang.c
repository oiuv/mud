// wuliang.c 事件：无量山玉壁剑舞

#include <ansi.h>

void create() { seteuid(getuid()); }

// 开始创建事件
void create_event()
{
        // 每月15日凌晨
        EVENT_D->at_after(0, 1, -15, -23);
}

// 奖励
private void do_bonus(object room)
{
        object *obs;
        object ob;
        string msg;
        int lvl;
        int r;

        obs = all_inventory(room);
        obs = filter_array(obs, (: playerp($1) && living($1) :));
        if (sizeof(obs) < 1)
                return;

        r = random(100);
        if (r == 0)
        {
                msg = HIW  "只见皎洁的月光下，两个飘逸绝伦的身影倒映在对面山壁之上，持剑翩翩起\n"
                           "舞，剑光顿挫，仙影回翔。你不由惊叹：寰宇之中，竟有如此绝奥之技，今\n"
                           "日有缘得见仙人之姿，实在是福分非浅。\n" NOR;

                message("vision", msg, obs);

                //obs->add("potential", 1000);
                obs->add("potential", 2000);
                //obs->add("combat_exp", 5000);
                obs->add("combat_exp", 10000);

                // 增加武学修养基本剑法及基本身法
                foreach (ob in obs)
                {
                        if (ob->query("combat_exp") > 2000000)
                        {
                                tell_object(ob, HIG "你心中暗自掂量，这二人当真是"
                                                "世上高手，不过自己似乎也可办到。\n" NOR);
                                continue;
                        }

                        if ((lvl = ob->query_skill("sword", 1)) >= 80 &&
                            ob->can_improve_skill("sword"))
                                ob->improve_skill("sword", 40000);

                        if ((lvl = ob->query_skill("dodge", 1)) >= 80 &&
                            ob->can_improve_skill("dodge"))
                                ob->improve_skill("dodge", 40000);

                        if ((lvl = ob->query_skill("martial-cognize", 1)) >= 80 &&
                            ob->can_improve_skill("martial-cognize"))
                                ob->improve_skill("martial-cognize", 20000);

                        tell_object(ob, HIG "你对仙人的剑舞颇有所感，武学上顿时有了新的领悟。\n" NOR);
                }

                // 记录事件
                MAP_D->record_rumor(obs, "无量山玉壁剑舞", this_object());

                CHANNEL_D->do_channel(this_object(), "rumor",
                                      "听说大理无量山又出仙人剑舞，仙影玄奇，令人匪夷所思。");
        } else
        if (r < 60)
        {
                switch (random(3))
                {
                case 0:
                        msg = HIY "只见对面无量山玉壁上仙影一闪即过，身形之敏捷，令你根本无法捕捉。\n" NOR;
                        break;
                case 1:
                        msg = HIY "只见无量山玉壁上闪过几道仙影，似乎是施展一种奇妙无比的武功绝学。\n" NOR;
                        break;
                default:
                        msg = HIY "忽然间两个飘逸绝伦的身影显映在对面山上，但仙影转瞬即逝，你根本无法看清。\n" NOR;
                        break;
                }
                msg += HIG "你受到了仙影的感悟，武学方面又有了一些体会。\n" NOR;
                //obs->improve_experience(100 + random(100));
                obs->improve_experience(500 + random(500));

                message("vision", msg, obs);

                // 记录事件
                MAP_D->record_rumor(obs, "无量山玉壁仙影", this_object());
        } else
        {
                switch (random(3))
                {
                case 0:
                        msg = WHT "眼见皎洁的月光升起，可是一团云飘过，遮盖了月光，你眼前顿时一片漆黑。\n" NOR;
                        break;
                case 1:
                        msg = WHT "你目不转睛的注视着对面的玉壁，可刹那间雷声轰鸣，山风卷云，将月光遮了个严实。\n" NOR;
                        break;
                default:
                        msg = WHT "夜晚已至，可一团团浓厚的云层却笼罩着天空，你连对面的山头都无法看清。\n" NOR;
                        break;
                }
                msg += HIG "你不禁叹息道：“怎奈缘分未至，无缘窥视仙影！”\n" NOR;

                message("vision", msg, obs);
        }
}

// 事件触发
void trigger_event()
{
        object room;

        // 无量山玉壁剑舞
        if (objectp(room = find_object("/d/wanjiegu/wlhoushan")))
                do_bonus(room);

        create_event();
}

// 描述
string query_detail(string topic)
{
        switch (topic)
        {
        case "无量山玉壁剑舞":
                return "皎洁的月光下，无量山壁上有仙人偏偏起舞，神姿仙态"
                       "平生难得一见。\n";

        case "无量山玉壁仙影":
                return "皎洁的月光下，壁上能隐隐约约倒影出仙人之姿。实乃"
                       "世间仅有。\n";

        }
}
