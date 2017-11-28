// paper.c
//
// 纸张可以用来作画，画好以后可以作为autoload物品载入。
// 保存的必要信息：
// draw/type    图画的类型
// draw/content 图画的描述
// draw/info    图画的附加信息

#include <ansi.h>
#include <command.h>

inherit ITEM;

void create()
{
        set_name(HIW "纸张" NOR, ({ "paper", "paper of drawing" }));
        set_weight(10);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "张");
                set("long", HIW "这是一张上等宣纸，你可以在上面画"
                            "(draw)点东西。\n" NOR);
                set("material", "paper");
                set("can_draw", 1);
        }
}

void init()
{
        add_action("do_draw", "draw");
        add_action("do_clear", "clear");
}

int do_draw(string arg)
{
        object me;
        object ob;
        int lvl;

        if (! arg)
                return notify_fail("你想画什么？打算画(draw here)这里"
                                   "的风景么？\n");

        me = this_player();
        lvl = me->query_skill("drawing", 1);
        if (arg != "here" && ! objectp(ob = present(arg, environment(me))))
                return notify_fail("这里没有你想要画的东西。\n");

        if (query("draw"))
                return notify_fail("这张纸已经画了东西，如果想再画需要"
                                   "先抹去(clear)。\n");

        message("vision", me->name() + "拿出一支笔，在纸上不知"
                "道画了些什么。\n", environment(me), ({ me }));

        if (arg == "here")
        {
                tell_object(me, "你拿出一支笔，仔细的临摹这里的风景。\n");
                if (lvl < 30)
                {
                        tell_object(me, "可是你的画画技巧实在是太差了，"
                                        "无从落笔，只好胡乱涂抹一阵。\n");
                        set("draw/content", "上面乱七八糟的看不出画的是"
                                            "什么。\n");
                        set("draw/info", "unknow");
                } else
                if (lvl < 80)
                {
                        tell_object(me, "虽然你的画画技巧不怎么样，但是"
                                        "好在学过一点，勉强画得。\n");
                        set("draw/content", "上面画的虽然有些凌乱，但是"
                            "还能看得出是" + environment(me)->short() +
                            "的风景。\n");
                        set("draw/info", base_name(environment(me)));
                } else
                {
                        tell_object(me, "你随意挥洒，风景登时飘然跃在纸"
                                        "上。\n");
                        set("draw/content", "上面画的是" + environment(me)->short() +
                            "的风景，极为传神，宛若亲临。\n");
                        set("draw/info", base_name(environment(me)));
                }                

                set("draw/type", "风景");
        } else
        if (ob->is_character())
        {
                if (ob != me)
                {
                        message("vision", me->name() + "不住的打量" + ob->name() +
                                "，手下不知道在画些什么东西。\n",
                                me, ob);
                        tell_object(me, "你拿出一支笔，仔细的临摹" + ob->name() + "。\n");
                } else
                {
                        command("consider");
                        tell_object(me, "你拿出一支笔，仔细的按照记忆中的样子描绘自己。\n");
                }
                if (lvl < 30)
                {
                        tell_object(me, "可是你的画画技巧实在是太差了，"
                                        "无从落笔，只好胡乱涂抹一阵。\n");
                        set("draw/content", "上面乱七八糟的看不出画的是"
                                            "什么。\n");
                        set("draw/info", "unknow");
                } else
                if (lvl < 80)
                {
                        tell_object(me, "虽然你的画画技巧不怎么样，但是"
                                        "好在学过一点，勉强画得。\n");
                        set("draw/content", "上面画的虽然有些凌乱，但是"
                            "还能看得出是" + ob->name() + "，有点神似。\n");
                        set("draw/info", ob->query("id"));
                } else
                {
                        string msg;
                        object cloth;

                        tell_object(me, "你随意挥洒，" + ob->name() +
                                        "登时飘然跃在纸上。\n");
                        msg = "摊看纸来，";
                        if (userp(ob))
                        {
                                cloth = ob->query_temp("armor/cloth");
                                if (ob->query("gender") == "女性")
                                {
                                        if (cloth)
                                                msg += "只见上面一名女子身着" + cloth->name() + "，";
                                        else
                                                msg += "只见上面一名女子一丝不挂、未着寸缕，";
                                } else
                                {
                                        if (cloth)
                                                msg += "只见上面一名男子身着" + cloth->name() + "，";
                                        else
                                                msg += "只见上面一名男子坦胸露乳，赤身裸体，";
                                }
                                msg += LOOK_CMD->description(ob);
                        }
                        msg += "原来上面画的是" + ob->name() +
                            "，果然传神之至，庶几破纸而出。\n";
                        set("draw/content", msg);
                        set("draw/info", ob->query("id"));
                }                

                set("draw/type", "人物");
        } else
        {
                tell_object(me, "你拿出一支笔，仔细的临摹" + ob->name() + "。\n");
                if (lvl < 30)
                {
                        tell_object(me, "可是你的画画技巧实在是太差了，"
                                        "无从落笔，只好胡乱涂抹一阵。\n");
                        set("draw/content", "上面乱七八糟的看不出画的是"
                                            "什么。\n");
                        set("draw/info", "unknow");
                } else
                if (lvl < 80)
                {
                        tell_object(me, "虽然你的画画技巧不怎么样，但是"
                                        "好在学过一点，勉强画得。\n");
                        set("draw/content", "上面画的虽然有些凌乱，但是"
                            "还能看得出是" + ob->name() + "，有点神似。\n");
                        set("draw/info", ob->query("id"));
                } else
                {
                        string msg;
                        //object cloth;

                        tell_object(me, "你随意挥洒，" + me->name() +
                                        "登时飘然跃在纸上。\n");
                        msg = "上面画的是" + ob->name() +
                            "，逼真之极。\n";
                        set("draw/content", msg);
                        set("draw/info", ob->query("id"));
                }                

                set("draw/type", "物品");
        }

        set("no_sell", 1);
        set("value", 1);

        return 1;
}

int do_clear(string arg)
{
        object me = this_player();

        if (! arg || ! id(arg))
                return notify_fail("你要擦干净什么东西？\n");

        if (! query("draw/type"))
        {
                write ("上面干干净净的什么也没有，不用再擦了。\n");
                return 1;
        }

        message_vision("$N轻轻的将纸插抹干净。\n", me);
        delete("draw");
        delete("no_sell");
        delete("value");
        return 1;
}

string long()
{
        return query("draw/type") ? query("draw/content") : query("long");
}

string query_autoload()
{
        mapping draw;

        if (! mapp(draw = query("draw")))
                return 0;

        return draw["type"] + "|" + draw["content"] + "|" + draw["info"];
}

void autoload(string param)
{
        string type;
        string content;
        string info;

        if (sscanf(param, "%s|%s|%s", type, content, info) != 3)
        {
                destruct(this_object());
                return;
        }

        set("no_sell", 1);
        set("value", 1);
        set("draw/type", type);
        set("draw/content", content);
        set("draw/info", info);
}
