// emei.c 事件：长白山天池夜陨

#include <ansi.h>

void create() { seteuid(getuid()); }

// 开始创建事件
void create_event()
{
        // 每凌晨12点
        EVENT_D->at_after(0, 0, 1, -1);
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
                msg = HIR "只听天空骤然传来一阵刺耳的摩擦声，你仰望上苍，发现穹苍里已豁然出现\n"
                          "无数颗流星。夜陨如雨飞坠，锋芒划空，尔落入天池之中，又再激起万股七\n"
                          "色浪涛，漆黑夜穹竟犹如白昼一般。你不禁感叹，大自然之威，当真神鬼莫\n"
                          "测。\n" NOR;

                msg += HIC "你仔细的观察了流星雨的全过程，发现其中竟有很多奥秘可以融于武学。\n" NOR;
                //obs->add("potential", 300);
                obs->add("potential", 3000);
                //obs->add("combat_exp", 500);
                obs->add("combat_exp", 5000);

                message("vision", msg, obs);

                // 增加基本身法、暗器。胡家弟子可以同时增加内功及刀法。
                foreach (ob in obs)
                {
                        if ((lvl = ob->query_skill("dodge", 1)) >= 80 &&
                            ob->can_improve_skill("dodge"))
                                ob->improve_skill("dodge", 80000);

                        if ((lvl = ob->query_skill("throwing", 1)) >= 80 &&
                            ob->can_improve_skill("throwing"))
                                ob->improve_skill("throwing", 80000);

                        if (ob->query("born_family") != "关外胡家")
                                continue;

                        if (ob->query_skill("mantian-xing", 1) >= 80 &&
                            ! ob->query("can_perform/mantian-xing/xing"))
                        {
                                tell_object(ob, HIM "你心中一动，登时有所感悟，领悟了满天星中穹外飞星这一绝技！\n" NOR);
                                ob->set("can_perform/mantian-xing/xing", 1);
                        }
                }

                // 记录事件
                MAP_D->record_rumor(obs, "天池流星雨", this_object());

                CHANNEL_D->do_channel(this_object(), "rumor",
                                      "听说长白山天池上夜空竟现流星雨，五彩缤纷，煞为壮观。");
        } else
        if (r < 40)
        {
                msg = RED "只听远处一阵刺耳的摩擦声，举目望去，发现竟有流星从天边划过，怎奈距\n"
                          "隔委实太远，根本无法看清。\n" NOR;

                msg += HIC "你观罢流星，隐隐的对暗器功夫有了一丝体会。\n" NOR;

                //obs->improve_skill("throwing", 300);
                obs->improve_skill("throwing", 15000);
                message("vision", msg, obs);

                // 记录事件
                MAP_D->record_rumor(obs, "夜空流星", this_object());
        } else
        {
                switch (random(2))
                {
                case 0:
                        msg = WHT "眼见天边一片明亮，知是流星雨将至，可怎奈间隔遥且云层厚，却无缘得见。\n" NOR;
                        break;
                default:
                        msg = WHT "眼见天边一片明亮，但是水气，雾气和云层交杂，让你什么都看不清楚。\n" NOR;
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

        // 长白山天池夜陨
        if (objectp(room = find_object("/d/guanwai/tianchi1")))
                do_bonus(room);

        create_event();
}

// 描述
string query_detail(string topic)
{
        switch (topic)
        {
        case "天池流星雨":
                return "长白山天池夜空能见流星雨，煞为壮观。\n";

        case "夜空流星":
                return "夜空常有流星陨落，颇为美丽。\n";
        }
}
