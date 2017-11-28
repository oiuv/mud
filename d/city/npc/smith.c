// smith.c

#include <ansi.h>

inherit "/inherit/char/smith.c";

mixed ask_back();

void create()
{
        set_name("铁匠", ({ "tie jiang", "tie", "smith" }));
        set("title", "铁匠铺老板");
        set("shen_type", 1);

        set("gender", "男性" );
        set("age", 33);
        set("long", "铁匠正用铁钳夹住一块红热的铁块放进炉中。\n");

        set("combat_exp", 400);
        set("attitude", "friendly");
        set("vendor_goods",({
                "/clone/weapon/changjian",
                "/clone/weapon/gangzhang",
                "/clone/weapon/changbian",
                "/clone/weapon/gangdao",
                "/clone/weapon/hammer",
                "/clone/weapon/dagger",
                "/clone/weapon/tiegun",
                "/clone/weapon/arrow",
                "/clone/weapon/bow",
                //新增长弓 2017-03-27
                "/clone/weapon/longbow",
                "/clone/weapon/wolfarrow",
                "/clone/cloth/tiejia",
                "/d/item/obj/jingtie",
        }));

        set("inquiry", ([
                "工作" : (: ask_me :),
                "job"  : (: ask_me :),
                "血海无边" : (: ask_back :),
        ]));

	setup();

	carry_object("/clone/misc/cloth")->wear();
}

varargs int receive_damage(string type, int n, object who)
{
        if (! objectp(who) || ! interactive(who) || who == this_object())
                return 0;

        tell_object(who, HIR "你发现" + name() +
                    HIR "诡秘一笑，忽然觉得一阵心悸，神智一阵恍惚。\n" NOR);
        return who->receive_damage(type, n, this_object());
}

varargs int receive_wound(string type, int n, object who)
{
        if (! objectp(who) || ! interactive(who) || who == this_object())
                return 0;

        tell_object(who, RED "你忽见" + name() +
                    RED "桀桀怪笑，只觉得浑身都是一痛，直入骨髓深处。\n" NOR);
        return who->receive_wound(type, n, this_object());
}

mixed ask_back()
{
        object me;

        me = this_player();
        if (me->query("family/family_name") != "血刀门")
        {
                message_vision("$N自顾自的干活，好象没有听见$n在说什么。\n",
                               this_object(), me);
                return -1;
        }

        message_sort(HIY "\n$N" HIY "猛地抬起头来，瞪着双目上上下下打量了$n"
                     HIY "好一会儿，微微点了点头。$N" HIY "随即放下手中的活"
                     "计，低声道：“都等你好长时间了，快跟我来。”说罢便领"
                     "着$p朝后厅走去。\n\n" NOR, this_object(), me);

        me->move("/d/city/xdmidao4");
        tell_object(me, CYN + name() + "说道：就是这里，你一直走南就行了。\n"
                        HIC + name() + "说完便急急忙忙赶了回去。\n" NOR);
        return -1;
}
