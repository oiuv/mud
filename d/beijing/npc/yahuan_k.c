inherit NPC;

void create()
{
        set_name("王府丫鬟", ({ "ya huan", "ya", "huan"}));
        set("gender", "女性" );
        set("age", 12);
        set("long", "一个十多岁的小姑娘，她是康亲王府的丫鬟\n");
        set("shen_type", 1);
        set("combat_exp", 2000);
        set("str", 17);
        set("dex", 20);
        set("con", 17);
        set("int", 22);
        set("attitude", "peaceful");
        set_skill("dodge",10);
        set_skill("unarmed",10);

        setup();
        carry_object("/d/beijing/npc/obj/nvcloth")->wear();
        add_money("silver", 3);
}

