#include <ansi.h>

inherit NPC;
inherit F_GUARDER;

void create()
{
        set_name("门卫", ({ "men wei", "men", "wei" }));
        set("long", @LONG
这是个年富力强的卫兵，样子十分威严。虽然
他们武艺不高，但是经过欧阳锋的训练，决非
常人可敌。
LONG);
        set("nickname", WHT "铁狮子" NOR);
        set("gender", "男性" );
        set("age", 22);
        set("attitude", "friendly");
        set("shen_type", -1);

        set("str", 23);
        set("int", 23);
        set("con", 22);
        set("dex", 20);

        set("max_qi", 1200);
        set("max_jing", 600);
        set("neili", 1700);
        set("max_neili", 200);
        set("combat_exp", 50000 + random(50000));
        set("score", 10000);

        set_skill("force", 100);
        set_skill("dodge", 80);
        set_skill("unarmed", 100);
        set_skill("parry", 80);

        set_temp("apply/attack", 50);
        set_temp("apply/defense", 50);
        set_temp("apply/damage", 50);
        set_temp("apply/armor", 50);

        set("coagents", ({
                ([ "startroom" : "/d/baituo/dating",
                   "id"        : "ouyang feng" ]),
        }));

        create_family("欧阳世家", 0, "侍卫");

        setup();
        add_money("silver", 2);
        carry_object("/d/baituo/obj/dadao")->wield();
}

void init()
{
        object ob;

        ::init();

        if (interactive(ob = this_player()) && ! is_fighting())
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
        if (! ob || environment(ob) != environment())
                return;

        if (check_family(ob, "欧阳世家"))
        {
                say(CYN "门卫笑吟吟地道：这位" + RANK_D->query_respect(ob) +
                    CYN "您辛苦了，快请进吧。\n" NOR);
                return;
        }

        if ((int)ob->query("shen") > 200)
        {
                say(CYN "门卫两眼一瞪道：这位" + RANK_D->query_respect(ob) +
                    CYN "你是来找麻烦的吧？\n");
                return;
        }
}
