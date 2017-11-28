// wedding-ring.h

#include <ansi.h>
#include <armor.h>
#include <command.h>

inherit HANDS;
inherit F_NOCLONE;
inherit F_OBSAVE;

string do_wear();
void set_attrib();

void create()
{
	set_name(HIG "结婚戒指" NOR, ({ "wedding ring", "ring" }) );
	set_weight(100);
	set("material", "gold");
	set("unit", "只");
	set("value", 50000);
        set("no_sell", "这你也要卖？不如把你自己卖了！");
	set("armor_prop/armor", 20);
	set("armor_prop/unarmed", 5);
	set("armor_prop/hand", 5);
	set("armor_prop/strike", 5);
	set("armor_prop/claw", 5);
	set("armor_prop/cuff", 5);
        set("armor_prop/unarmed_damage", 8);
        set("wear_msg", (: do_wear :));
        set("remove_msg", HIG "$N" HIG "把$n" HIG "脱了下来。\n" );
        if (! check_clone()) return 0;

        set("stable", 0);

        setup();
        ::restore();
        set_attrib();
}

void set_attrib()
{
        int per;
        int lvl;
        int tname;
        string desc;

        // 计算对容貌的影响
        lvl = query("enchase/lvl");
        per = query("enchase/point") * lvl / 10000;
        set("armor_prop/per", per);

        // 生成描述
        tname = query("enchase/name");
        desc = query("long");
        if (stringp(tname))
        {
                if (lvl >= 300)
                {
                        desc += HIG "上面镶嵌着" + tname + HIG
                                "，巧夺天工，美得异乎寻常，让" + name() +
                                HIG "越发显得精致。\n" NOR;
                } else
                if (lvl >= 200)
                {
                        desc += HIG "上面镶嵌着" + tname + HIG
                                "，几乎没有瑕疵，可谓人间罕见的珍品。\n" NOR;
                } else
                {
                        desc += HIG "上面镶嵌着" + tname + HIG
                                "，衬托出" + name() + HIG +
                                "的不俗，只是有些少瑕疵显得美中不足。\n" NOR;
                }
                set("long", desc);
        }
}

string do_wear()
{
        object me;
        string msg;
        string tname;
        int point;

        me = this_player();
        tname = query("enchase/name");
        point = query("enchase/point");

        if (me->query("gender") == "女性")
        {
                msg = HIG "$N" HIG "轻巧巧的戴上了一个$n"
                      HIG "，璨然一笑，映的宝光四射，直令得花儿也憔悴了。\n" NOR;
                if (stringp(tname))
                {
                        if (point >= 150)
                                msg += HIG "只见" + tname + HIG "闪过"
                                       "一道光芒，映射得$N" HIG "有若"
                                       "仙子落凡，令人心弛神摇。\n" NOR;
                        else
                        if (point >= 100)
                                msg += HIG "只见" + tname + HIG "闪闪"
                                       "发光，衬托得$N" HIG "说不出的"
                                       "娇媚。\n" NOR;
                        else
                                msg += HIG "只见" + tname + HIG "闪了"
                                       "一下，照亮了$N" HIG "隽秀的容颜"
                                       "。\n" NOR;
                }
        } else
        {
                msg = HIG "$N" HIG "戴上了一个$n"
                      HIG "，当下意气风发，神完气足。\n" NOR;
                if (stringp(tname))
                {
                        if (point >= 150)
                                msg += HIG "只见" + tname + HIG "闪过"
                                       "一道光芒，映射得$N" HIG "如同"
                                       "天神降世，令人目瞪口呆。\n" NOR;
                        else
                        if (point >= 100)
                                msg += HIG "只见" + tname + HIG "闪闪"
                                       "发光，让$N" HIG "越发显得挺拔"
                                       "神气。\n" NOR;
                        else
                                msg += HIG "只见" + tname + HIG "闪了"
                                       "一下，照亮了$N" HIG "的脸庞。\n" NOR;
                }
        }
        return msg;
}

int receive_summon(object me)
{
        object env;
        object temp;

        if ((env = environment()) && env == me)
        {
                write(name() + "不就在你身上嘛？你召唤个什么劲？\n");
                return 1;
        }

        if (env == environment(me))
        {
                message_vision(HIG "只见地上的" + name() +
                               HIG "化作一道光芒，飞跃至$N" HIW
                               "的掌中！\n\n" NOR, me);
        } else
        {
                if (env)
                {
                        if (env->is_character() && environment(env))
                                        env = environment(env);

                        message("vision", HIG "突然" + name() + HIG "化作一道"
                                HIG "光芒消失了！\n\n" NOR, env);

                        if (interactive(env = environment()))
                        {
                                tell_object(env, HIM + name() +
                                                 HIM "忽然离你而去了！\n" NOR);
                        }
                }

                message_vision(HIG "一道光芒划过，只见$N"
                               HIG "掌中多了一个$n" HIG "！\n\n" NOR,
                               me, this_object());
        }

        move(me, 1);
        if (environment() != me)
                return 1;

        temp = me->query_temp("armor/" + query("armor_type"));
        if (temp) temp->unequip();
        WEAR_CMD->do_wear(me, this_object());

        return 1;
}

// 镶嵌
int do_enchase(object me, object tessera)
{
        object item;
        int lvl;

        item = this_object();
        if (stringp(item->query("enchase/name")))
                return notify_fail("现在" + item->name() + "上面"
                                   "已经镶嵌了物品了。\n");

        if (tessera->query_wight() > 100)
                return notify_fail("这件物品也太重了，你怎么镶嵌上去啊？\n");

        if (query("equipped"))
                return notify_fail("你现在正戴着它呢，怎么镶嵌呢？先脱下来吧。\n");

        if (! tessera->query("can_be_enchased"))
                return notify_fail("天啊，你还没有这手艺把" +
                                   tessera->name() + "镶嵌上去。\n");

        if ((lvl = me->query_skill("certosina", 1)) < 100)
                return notify_fail("你的镶嵌技术不到，无法完"
                                   "成这么精细活儿。\n");

        message_vision("只听“喀啦”一声，$N已经把" + tessera->name() +
                       "规规举举的镶嵌到了$n上面。\n", me, item);
        if (lvl >= 300)
                message_vision("一时间，你只觉得$N宝气顿生，尊华"
                               "无比，实在是人间神品，没有半点瑕疵。\n", item);
        else
        if (lvl >= 200)
                message_vision("只见$N宝气四射，变得越发妍美，庶"
                               "几没有半点缺憾。\n", item);
        else
                message_vision("只见$N顿时平添几分丽色，虽然有"
                               "些小小缺憾，也是瑕不掩瑜。\n", item);
        set("enchase/name", tessera->name());
        set("enchase/point", tessera->query("magic/power"));
        set("enchase/lvl", lvl);
        save();
        destruct(tessera);
        set_attrib();

        return 1;
}

// 进行保存数据的接口函数
mixed save_dbase_data()
{
        mapping data;
        object  user;

        data = ([ "enchase" : query("enchase") ]);

        if (! objectp(user = environment()))
                data += ([ "user" : query("user") ]);
        else
        if (playerp(user))
                data += ([ "user" : user->name(1) + "(" + user->query("id") + ")" ]);

        return data;
}

// 接受存盘数据的接口函数
int receive_dbase_data(mixed data)
{
        if (! mapp(data))
                return 0;

        if (mapp(data["enchase"]))
                set("enchase", data["enchase"]);

        if (stringp(data["user"]))
                set("user", data["user"]);

        return 1;
}

int query_autoload() { return 1; }
