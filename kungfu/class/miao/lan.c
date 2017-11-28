#include <ansi.h>

inherit NPC;

void create()
{
        set_name("苗若兰", ({ "miao ruolan", "miao", "ruolan" }));
        set("gender", "女性");
        set("title", "苗人凤千金");
        set("age", 17);
        set("long", @LONG
一位衣着秀丽的少女，长得美丽动人。她就是
苗人凤之女苗若兰。
LONG );
        set("attitude", "peaceful");
        set("str", 12);
        set("int", 11);
        set("con", 13);
        set("dex", 11);
        set("per", 30);

        set("qi", 300);
        set("max_qi", 300);
        set("combat_exp", 10000);
        set("score", 20000);
        set_skill("literate", 100);

        set("inquiry", ([
                "苗家剑谱" : "剑谱一向是我爹爹收着的，你去问他好了。",
                "胡一刀"   : "胡伯伯是我爹爹一生中最敬佩的人，可是…唉……",
                "胡斐"     : "你是说胡大哥？…唉…他已经回辽东了。",
        ]));

        create_family("中原苗家", 7, "千金");

        setup();

        carry_object("/d/city/npc/cloth/zi-dress")->wear();
        add_money("silver", 20);
}

void attempt_apprentice(object ob)
{
        command("xixi");
        command("say 我又不会武功，你拜我作什么？");
}
