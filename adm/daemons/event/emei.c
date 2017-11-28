// emei.c 事件：峨嵋金顶日出

#include <ansi.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

// 开始创建事件
void create_event()
{
        // 明天5点钟日出
        EVENT_D->at_after(0, 0, 1, -5);
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

        r = random(365);
        if (r == 0)
        {
                msg = HIR "只见太阳一点一点的升了起来，倏的眼前一亮，只见一道光晕出现在云际，\n"
                          "朦朦胧胧似乎有一个人影立在当中，令人叹羡不已。\n" NOR;
                msg += HIG "你冥冥中仿佛得到了佛主的指示，登时有茅塞顿开的感觉。\n" NOR;
                //obs->add("potential", 1000);
                obs->add("potential", 5000);

                // 佛门弟子增加佛学技能
                foreach (ob in obs)
                {
						//非佛门弟子也可增加
                        //if (ob->query("class") != "bonze")
                        //        continue;

                        if ((lvl = ob->query_skill("buddhism", 1)) >= 50)
                                ob->set_skill("buddhism", lvl + 1);

                        if ((lvl = ob->query_skill("mahayana", 1)) >= 50)
                                ob->set_skill("mahayana", lvl + 1);

                        if ((lvl = ob->query_skill("lamaism", 1)) >= 50)
                                ob->set_skill("lamaism", lvl + 1);
                }

                message("vision", msg, obs);

                // 记录事件
                MAP_D->record_rumor(obs, "峨嵋佛光", this_object());

                CHANNEL_D->do_channel(this_object(), "rumor",
                                      "听说峨嵋金顶佛光出现，令人叹为观止，赞叹不已。");
        } else
        if (r < 250)
        {
                switch (random(3))
                {
                case 0:
                        msg = HIY "一轮红日跃出天际，映射得层峦叠翠分外妖娆，茫茫云海，尽披红妆。\n" NOR;
                        break;
                case 1:
                        msg = HIY "忽然间一轮红日跃了上来，天地之间登时辉煌无比，只射得你眼睛都无法睁开。\n" NOR;
                        break;
                default:
                        msg = HIY "蓦然眼前金光四射，一轮红日冉冉升起。\n" NOR;
                        break;
                }
                msg += HIG "你心头闪过一道灵光，似乎受到了某种启迪。\n" NOR;
                //obs->improve_potential(10 + random(10));
                obs->improve_potential(100 + random(100));

                message("vision", msg, obs);

                // 记录事件
                MAP_D->record_rumor(obs, "峨嵋日出", this_object());
        } else
        {
                switch (random(3))
                {
                case 0:
                        msg = WHT "眼见太阳朦朦胧胧的就要升上来，却见一片乌云飘过，遮了个严严实实。\n" NOR;
                        break;
                case 1:
                        msg = WHT "你眼前越来越亮，但是雾气好重，让你什么都看不清楚。\n" NOR;
                        break;
                default:
                        msg = WHT "天边渐渐的发白，但是一层一层的云气将日头压得光芒一丝都看不见。\n" NOR;
                        break;
                }
                msg += HIG "你心中连叹：“太可惜了！”\n" NOR;

                message("vision", msg, obs);
        }
}

// 事件触发
void trigger_event()
{
        object room;

        // 峨嵋金顶日出
        if (objectp(room = find_object("/d/emei/jinding")))
                do_bonus(room);

        create_event();
}

// 描述
string query_detail(string topic)
{
        switch (topic)
        {
        case "峨嵋佛光":
                return "峨嵋佛光是峨嵋山独特的景观，你能在远处天边的光晕中"
                       "看到你自己的身影，非常的奇妙。\n";

        case "峨嵋日出":
                return "在峨嵋山上欣赏日出令人心旷神怡，格外领略峨嵋山的隽"
                       "秀险奇。\n";
        }
}
