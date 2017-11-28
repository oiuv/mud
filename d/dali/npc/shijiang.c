// shijiang.c

inherit NPC;

void create()
{
	set_name("石匠",({ "shi jiang", "jiang" }) );
        set("gender", "男性" );
        set("age", 52);
        set("long", "他是一个打磨大理石的石匠，身上只穿了一件坎肩，全身布满了厚实的肌肉。\n");
        set_temp("apply/defense", 15);
	set("combat_exp", 1700);
	set("shen_type", 1);
        set("per", 18);
        set("str", 24);
        set("dex", 25);
        set("con", 36);
        set("int", 15);
        set("attitude", "friendly");
        set("chat_chance",2);
        set("chat_msg", ({
"石匠有一下没一下的凿着手中的一块碑文，嘴里嘟囔着，“苍山之腹盛产奇石，
世称大理石，大理也因石而名扬天下。”\n"
        }));

        setup();
        carry_object("/clone/weapon/hammer")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

