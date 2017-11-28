// puliu.c 事件：黄果树瀑布

#include <ansi.h>

void create() { seteuid(getuid()); }

// 开始创建事件
void create_event()
{
        // 明天5点钟瀑流最急
        EVENT_D->at_after(0, 0, 1, -5);
}

// 奖励
private void do_bonus(object room)
{
        object *obs;
//      object ob;
        string msg;
//      int lvl;
        int r;

        obs = all_inventory(room);
        obs = filter_array(obs, (: playerp($1) && living($1) :));
        if (sizeof(obs) < 1)
                return;

        r = random(365);
        if (r == 0)
        { 
                msg = HIR "只听轰隆隆声音大做，发耳欲聩，令人心神俱摇！你抬头看去，只见\n"
                          "晨曦中黄果树瀑布笼罩着层层雾气，分外要人。水流飞泻，气势惊人！\n" NOR;
                msg += HIG "你望着湍急的瀑布飞练，为这世间美景惊叹不已，从"
                           "中不禁领悟到了武学的道理。\n" NOR; 
                //obs->add("combat_exp", 1000);
                obs->add("combat_exp", 5000);
                //obs->add("potential", 500);
                obs->add("potential", 2000);

                message("vision", msg, obs);

                // 记录事件
                MAP_D->record_rumor(obs, "黄果树激流", this_object());

                CHANNEL_D->do_channel(this_object(), "rumor",
                                      "听说黄果树激流澎湃，奇景非凡，无数游人叹羡不已。");
        } else 
        if (r < 250) 
        {
                msg = HIY "一阵轰隆轰隆的声音传来，你抬头一看，只见晨曦中瀑布腾起层层雾气。\n" NOR;
                switch (random(3)) 
                { 
                case 0: 
                        msg += HIY "看着这壮丽的瀑流，你不禁感叹，正所谓「飞流直"
                                    "下三千尺，疑是银河落九天」啊。\n" NOR; 
                        break; 
                case 1: 
                        msg += HIY "瀑流就像一席倒挂的白帘，气势如虹，天地都不禁为之失色。\n" NOR; 
                        break; 
                default: 

                        msg += HIY "瀑流直如水银泄地一般，水花四溅。\n" NOR; 
                        break; 
                } 
                msg += HIG "观赏着飞流直下的水瀑，你不由得感叹自然造化的奇妙，隐"
                           "隐然对武学也有了一点领会。\n" NOR; 
                //obs->improve_potential(5 + random(7));
                obs->improve_potential(50 + random(50));
                //obs->add("combat_exp", 20 + random(10));
                obs->add("combat_exp", 200 + random(100));
 
                message("vision", msg, obs);

                // 记录事件
                MAP_D->record_rumor(obs, "黄果树瀑布", this_object());
        } else
        {
                switch (random(3))
                {
                case 0:
                        msg = WHT "瀑流渐渐缓了下来。\n" NOR;
                        break;
                case 1:
                        msg = WHT "瀑流总是不见有增强的趋势。\n" NOR;
                        break;
                default:
                        msg = WHT "瀑流有如小桥流水，叮叮咚咚，离你所期望的相差甚远。\n" NOR;
                        break;
                }
                msg += HIG "你心中大感失望。\n" NOR;

                message("vision", msg, obs);
        }
} 
 
// 事件触发 
void trigger_event() 
{ 
        object room; 
        // 黄果树瀑流 
        if (objectp(room = find_object("/d/dali/huanggs"))) 
                do_bonus(room); 
 
        create_event(); 
} 

// 描述 
string query_detail(string topic) 
{ 
        switch (topic) 
        { 
        case "黄果树激流": 
                return "黄果树瀑布水流湍急，时有激流澎湃，乃是罕见的景观。\n"; 
 
        case "黄果树瀑布": 
                return "大理的黄果树瀑布自然风光迷人，瀑流美丽壮观。\n"; 
        }
} 