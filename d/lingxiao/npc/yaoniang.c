inherit NPC;

void create()
{
        set_name("窈娘", ({ "yao niang", "yao", "niang" }) );
        set("gender", "女性" );
        set("long", "窈娘是白自在的妾侍，很得白自在宠信。\n");
        set("age", 17);
        set("max_qi", 800);
        set("max_jing", 500);
        set("combat_exp", 10000);

        set("str", 16);
        set("con", 24);
        set("dex", 30);
        set("int", 27);

        set("attitude", "friendly");
        set("inquiry", ([
            	"白自在" : "老爷子不知为什么，把自己关到监狱里。说是思什么过。",
            	"监狱"   : "没少爷同意，你是进不去的。",
        ]) );

        setup();
        carry_object("/clone/cloth/cloth")->wear();
}



