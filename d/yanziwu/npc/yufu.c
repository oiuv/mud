#include <ansi.h>

inherit KNOWER;

void create()
{
        set_name("渔夫", ({ "yu fu", "yu", "fu" }));
        set("nickname", HIC "消息灵通" NOR);
        set("gender", "男性");
        set("age", 40 + random(10));
        set("long", "一个头戴斗笠的渔夫，正悠然自得地在岸边垂钓。\n");

        set("attitude", "friendly");

        set("combat_exp", 60000);
        set("shen_type", 1);

        set_skill("unarmed", 50);
        set_skill("blade", 50);
        set_skill("parry", 50);
        set_skill("dodge", 50);

        set_temp("apply/attack", 15);
        set_temp("apply/defense", 15);
        set_temp("apply/damage", 20);

        setup();
        set("chat_chance", 1);
        set("chat_msg", ({
                CYN "渔夫看了你一眼，自言自语道：这世道真是越来越不太平了。\n" NOR,
        }) );
        carry_object("/clone/cloth/cloth")->wear();
        add_money("coin", 20);
}
