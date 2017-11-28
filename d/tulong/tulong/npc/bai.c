#include <ansi.h>
inherit NPC;
void create()
{
        set_name("白龟寿", ({ "bai guishou", "bai", "guishou"}) );
        set("long", "一个五十来岁的老者，秃着头顶，一身结实的肌肉。\n");
        set("attitude", "heroism");
        set("title", "天鹰教");
        set("nickname", HIW "玄武坛坛主" NOR);
        set("combat_exp", 500000);
        set("age", 50);
        set("chat_chance_combat", 2);
        set("chat_msg_combat", ({
                "白龟寿喝道：无耻小贼，竟敢打屠龙刀的主意？\n",
        }) );
        set_skill("force", 100+random(60));
        set_skill("hunyuan-yiqi", 100+random(60));
        set_skill("dodge", 100+random(60));
        set_skill("shaolin-shenfa", 100+random(60));
        set_skill("finger", 100+random(60));
        set_skill("nianhua-zhi", 100+random(60));
        set_skill("parry", 100+random(60));

        map_skill("force", "hunyuan-yiqi");
        map_skill("dodge", "shaolin-shenfa");
        map_skill("finger", "nianhua-zhi");
        map_skill("parry", "nianhua-zhi");

        set_temp("apply/attack", 50+random(50));
        set_temp("apply/defense", 50+random(50));
        set_temp("apply/armor", 50+random(50));
        set_temp("apply/damage", 50+random(50));

        setup();

        carry_object("/d/tulong/tulong/npc/obj/jiaofu")->wear();
}

