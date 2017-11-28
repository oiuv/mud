// map.c

#include <ansi.h>

inherit F_CLEAN_UP;

int map_view(object me, string arg);
int map_rumor(object me, string arg);

void create() 
{
	seteuid(getuid());
}

int main(object me, string arg)
{
        string here, name;
        object env;
        string *mapped;
        int lvl;
        int exp, pot, score;
        int pot_limit;
        string msg;
        mixed prompt;

        if (! arg)
                return notify_fail("格式：map here | rumor | view | all | <地点> | <珍闻>。\n");

        if (arg == "rumor")
                return map_rumor(me, arg);

        if (arg != "here")
                return map_view(me, arg);

        if (! me->query("out_family"))
        {
                write("你现在还没有从师傅那里领到地图册。\n");
                return 1;
        }

        // 查阅当前的环境
        env = environment(me);
        name = env->short();
        if (! stringp(here = env->query("outdoors")))
        {
                write("只有在户外才有必要绘制地图。\n");
                return 1;
        }

        if (! stringp(name) || clonep(env))
        {
                write("这里是一处神秘的地方，你无法判断它的方位。\n");
                return 1;
        }

        if (me->query("map_all"))
        {
                write("你已经获得了地图全集，没有必要再绘制地图了。\n");
                return 1;
        }

        if (me->is_busy())
        {
                write("你现在正忙，没有时间绘制地图。\n");
                return 1;
        }

        // 查阅已经绘制过的地图
        mapped = me->query("map/" + here);
        if (! arrayp(mapped)) mapped = ({ });
        if (member_array(name, mapped) != -1)
        {
                write("你已经绘制过这附近的地图了，没有必要"
                      "再重复了。\n");
                return 1;
        }

        if (! MAP_D->been_known(here))
        {
                write("你觉得这里没什么好画的。\n");
                return 1;
        }

        if (prompt = env->query("no_map"))
        {
                // no draw here
                if (stringp(prompt))
                        write(prompt);
                else
                        write("你看了半天，也没有弄清楚附近的地形。\n");
                return 1;
        }

        if (me->query("jing") < 50)
        {
                write("你的精神不佳，无法集中全神贯注的绘制地图。\n");
                return 1;
        }

        // 消耗精
        me->receive_damage("jing", 20 + random(30));

        if ((lvl = me->query_skill("drawing", 1)) < 30)
        {
                write("你在纸上涂抹了一会儿，连自己都看不出是什么东西。\n");
                return 1;
        }

        message("vision", me->name() + "抬头看了看四周，埋头"
                "仔仔细细的绘制着什么。\n", environment(me), ({ me }));
        tell_object(me, "你精心的绘制了" + name + "附近的地形。\n");

        mapped += ({ name });
        me->set("map/" + here, mapped);

        if (! wizardp(me))
	        me->start_busy(1 + random(3));

        // 计算奖励
        if (lvl > 200)
                lvl = (lvl - 200) / 4 + 150;
        else
        if (lvl > 100)
                lvl = (lvl - 100) / 2 + 100;

        exp = 20 + random(20);		//2015年4月4日 pot&score奖励增加
        pot = 10 + random((lvl - 20) / 2);
        score = random(4);
        pot_limit = me->query_potential_limit() - me->query("potential");
        if (pot_limit < 0)
                pot_limit = 0;
        if (pot >= pot_limit)
                pot = pot_limit;

        msg = "你获得了" + chinese_number(exp) + "点经验";
        if (pot > 0)
                msg += "和" + chinese_number(pot) + "点潜能";

        if (score)
                msg += "，通过体验，你累积了" + chinese_number(score) +
                       "点江湖阅历";

        // 奖励生效
        write(HIC + msg + "。\n" NOR);
        me->add("combat_exp", exp);
        me->add("potential", pot);
        me->add("score", score);

	return 1;
}

// 查看已经绘制部分的地图
int map_view(object me, string arg)
{
        mapping mapped;
        mapping rumor;
        string outdoors;
        string *shorts;
        string result;
        string key;

        if (! me->query("out_family"))
        {
                write("你还没有出门历练，开始绘制地图呢。\n");
                return 1;
        }

        mapped = me->query("map");
        if (! me->query("map_all") && ! mapp(mapped))
        {
                write("你还没有绘制任何一个地方的地图。\n");
                return 1;
        }

        if (me->is_busy())
        {
                write("你现在正忙，没法查看地图。\n");
                return 1;
        }

        message_vision("$N拿出一本东西，哗啦哗啦的"
                       "翻开看了起来。\n", me);

        if (! wizardp(me))
	        me->start_busy(1);

        // 察看是否阅读记载
        if (mapp(rumor = me->query("rumor")) &&
            member_array(arg, keys(rumor)) != -1)
        {
                write("你翻到地图册的后面，仔细阅读有关『" + arg +
                      "』的记载。\n" WHT + rumor[arg]->query_detail(arg) + NOR);
                return 1;
        }

        // 是否是察看本地地图？
        if (arg == "view" || me->query("map_all"))
        {
                write(MAP_D->marked_map(environment(me)));

	        if (! wizardp(me))
        	        me->start_busy(2);

                return 1;
        }

        // 判断是否是中文地图名字
        foreach (key in keys(mapped))
                if (MAP_D->query_map_short(key) == arg)
                {
                        // 是中文名字，转换成英文ID
                        arg = key;
                        break;
                }

        // 查找这方面的地图
        if (arrayp(shorts = mapped[arg]))
        {
                result = MAP_D->query_maps(arg);
                foreach (key in shorts)
                {
                        reset_eval_cost();
                        if (! stringp(key))
                                continue;
                        result = MAP_D->mark_map(result, key);
                }
                result = replace_string(result, "@R", WHT);
                result = replace_string(result, "@N", NOR);
                me->start_more(MAP_D->query_map_short(arg) + "的地图信息：\n" + result);

	        if (! wizardp(me))
	                me->start_busy(2);

                return 1;
        }

        if (arg != "all")
        {
                write("你的地图册中并没有有关 " + arg + " 的信息啊！\n");
                return 1;
        }

        outdoors = environment(me)->query("outdoors");
        if (stringp(outdoors))
                result = "你现在身处" + MAP_D->query_map_short(outdoors) + "境内。\n";

        result = "目前你已经绘制了以下这些地方的地图：\n";
        foreach (key in keys(mapped))
                result += MAP_D->query_map_short(key) + "("
                          HIY + key + NOR ")\n";
        write(result);
        return 1;
}

int map_rumor(object me, string arg)
{
        mapping rumor;
        string msg;

        if (! mapp(rumor = me->query("rumor")))
        {
                write("你现在并没有记录任何传闻趣事。\n");
                return 1;
        }

        msg = "你目前记载了有关" + implode(keys(rumor), "、") + "的传闻。\n";
        msg = sort_string(msg, 60);
        write(msg);
        return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : map here | rumor | all | view | <地点> | <珍闻>

如果你身上有了地图册，就可以使用这条命令绘制附近的地图。当然
你必须是在户外，并且具备有一定的绘画技巧才可以。绘制地图可以
增加你的经验、潜能并积累江湖阅历。

使用 map all 可以查看你现在已经绘制了哪些地方的地图， 而如果
指名了具体的地方，则可以查看该地点的地图绘制情况。

如果你在户外，则可以使用 map view 命令查看你所在的地点。

map rumor 可以查阅你目前记录的各地珍闻，使用 map <珍闻> 则可
以查看具体内容。
HELP );
    return 1;
}
