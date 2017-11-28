// /tengyilei.c

#include <ansi.h>
inherit NPC;

void create()
{
        set_name("滕一雷", ({ "teng yilei", "teng" }));
        set("long",@LONG
他是关外六魔中的大魔滕一雷。手中一只独脚铜人，看来大是不轻。
LONG );
        set("nickname", HIY "关外大魔" NOR);
        set("gender", "男性");
        set("age", 46);
        set("attitude", "peaceful");
        set("shen_type", -1);
        set("str", 50);
        set("int", 20);
        set("con", 30);
        set("dex", 20);
        set("max_qi", 1500);
        set("max_jing", 500);
        set("neili", 1500);
        set("max_neili", 1500);
        set("jiali", 100);
        set("combat_exp", 180000);
        set("score", 20000);

        set_skill("force", 80);
        set_skill("xiaowuxiang", 50);
        set_skill("dodge", 50);
        set_skill("shenkong-xing", 60);
        set_skill("unarmed", 90);
        set_skill("yujiamu-quan", 40);
        set_skill("parry", 60);
        set_skill("hammer", 100);
        set_skill("riyue-lun", 100);

        map_skill("force", "xiaowuxiang");
        map_skill("dodge", "shenkong-xing");
        map_skill("unarmed", "yujiamu-quan");
        map_skill("parry", "riyue-lun");
        map_skill("hammer", "riyue-lun");

        setup();
        carry_object("/clone/cloth/cloth")->wear();
        carry_object(__DIR__"obj/tongren")->wield();
        add_money("silver",50);
}

