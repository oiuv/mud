#include <ansi.h>

inherit NPC;
inherit F_DEALER;

int redeem(string arg);
mixed ask_back();

void create()
{
        set_name("唐楠", ({ "tang nan", "tang", "nan" }));
        set("title", "当铺老板");
        set("shen_type", 0);
        set("gender", "男性");
        set_max_encumbrance(100000000);
        set("age", 35);
        set("str", 100);
        set("long", "据说唐楠是四川唐家的后代。\n");
        set("no_get_from", 1);

        set_skill("unarmed", 60);
        set_skill("dodge", 60);
        set_temp("apply/attack", 30);
        set_temp("apply/attack", 30);
        set_temp("apply/damage", 15);

        set("combat_exp", 50000);
        set("attitude", "friendly");

        set("inquiry", ([
                "金轮九转" : (: ask_back :),
        ]));

        setup();
        carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        add_action("do_list", "list");
        add_action("do_buy", "buy");
        add_action("do_sell", "sell");
        add_action("do_value", "value");
}

mixed ask_back()
{
        object me;

        me = this_player();
        if (me->query("family/family_name") != "大轮寺")
        {
                message_vision(CYN "$N" CYN "一脸茫然道：啥？刚才你说啥？\n" NOR,
                               this_object(), me);
                return -1;
        }

        message_sort(HIY "\n$N" HIY "看了看$n" HIY "，阴笑两声，随即在$n"
                     HIY "耳边低声说道：“小的早就为您老人家准备好了，就"
                     "在柜台后面，您快跟我来吧。”说罢$N" HIY "便领着$n"
                     HIY "快步朝后厅走去。\n\n" NOR, this_object(), me);
        me->move("/d/city/xsmidao");
        tell_object(me, CYN + name() + "说道：就是这里，你一直走南就行了。\n"
                        HIC + name() + "说完便急急忙忙赶了回去。\n" NOR);
        return -1;
}

void unconcious()
{
        die();
}

void die()
{
        message_vision("\n$N死了。\n", this_object());
        destruct(this_object());
}
