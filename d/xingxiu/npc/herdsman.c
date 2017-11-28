#include <ansi.h>
inherit NPC;

void create()
{
        set_name("牧羊人", ({ "muyang ren", "ren", "heardsman" }));
        set("gender", "男性");
        set("age", 60 + random(10));
        set("long", "一个维吾尔族老汉，赶着几十只羊。\n");

        set("attitude", "friendly");

        set("combat_exp", 1000);
        set("shen_type", 1);

        set_skill("unarmed", 20);
        set_skill("dodge", 20);
        set_skill("parry", 20);
        set_skill("whip", 20);

        set_temp("apply/attack", 10);
        set_temp("apply/defense", 10);
        set("inquiry", ([
                "星宿派" : "他们躲在星宿海。",
                "星宿海" : "星宿海在深涧西边。\n",
                "深涧" : "我没过去过。听说只有采药的和星宿派弟子能徒手过去。\n",
        ]) );

        setup();
        set("chat_chance", 10);
        set("chat_msg", ({
              CYN "牧羊老汉伤心地说道：那帮星宿派弟子昨天又抢了我一只羊。\n" NOR,
              CYN "牧羊老汉呆呆的望着羊群发起愣来了。\n" NOR,
        }) );

        carry_object("/clone/cloth/wcloth")->wear();
        carry_object("/clone/weapon/bian")->wield();
}


