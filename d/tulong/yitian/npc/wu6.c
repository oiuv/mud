#include <ansi.h> 

inherit NPC;
inherit F_UNIQUE;

void create()
{
        set_name("ÎâÁùÆÆ", ({ "wu liupo", "liupo", "wu"}));
        set("title", HIC "Éñ¼ı°ËĞÛ" NOR);
        set("gender", "ÄĞĞÔ");
        set("age", 25);
        set("attitude", "peaceful");
        set("shen_type", -1);
        set("str", 25);
        set("int", 25);
        set("con", 25);
        set("dex", 25);

        set("max_qi", 1000);
        set("max_jing", 500);
        set("max_neili", 800);
        set("neili", 800);
        set("jiali", 50);

        set("combat_exp", 20000 + random(20000));

        set("chat_chance_combat", 200);
        set("chat_msg_combat", ({
                (: perform_action, "throwing.baibu" :),
        }) );

        set_skill("dodge", 80);
        set_skill("unarmed", 80);
        set_skill("throwing", 80);
        set_skill("xuanyuan-arrow", 80);
        set_skill("changquan", 80);
        set_skill("lingxu-bu", 80);
        set_skill("force", 80);
        set_skill("hunyuan-yiqi", 80);

        map_skill("force", "hunyuan-yiqi");
        map_skill("dodge", "lingxu-bu");
        map_skill("parry", "changquan");
        map_skill("throwing", "xuanyuan-arrow");
        map_skill("unarmed", "changquan");

        setup();

        carry_object("/clone/misc/cloth")->wear();
        carry_object("/d/tulong/yitian/npc/obj/gong")->wear();
        set_temp("is_riding", BLK "Ñ©ÌãÂí" NOR);
        set_temp("handing", carry_object("/d/mingjiao/yuan/obj/arrow"));
}

