// jia.c 

inherit NPC;

void create()
{
	set_name("贾人达", ({ "jia renda", "jia", "renda" }));
	set("gender", "男性");
	set("age", 25);
	set("long", "他就是「青城派」中最为同门不齿、最下达的家伙。\n");

	set("combat_exp", 30000);
	set("shen_type", -1);

	set_skill("sword", 30);
	set_skill("pixie-sword", 30);
	set_skill("unarmed", 30);
	set_skill("dodge", 30);
	set_skill("parry", 30);
	map_skill("parry", "pixie-sword");
	map_skill("sword", "pixie-sword");
	create_family("青城派", 6, "弟子");
	setup();
	carry_object("/clone/weapon/changjian")->wield();
	carry_object("/d/wudang/obj/bluecloth")->wear();
}
void init()
{
        object ob;

        ::init();
        if( interactive(ob=this_player()) && !is_fighting() )
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
	if (ob->query("gender")=="女性")
		say("贾人达嬉皮笑脸道：这位花姑娘身材硬是要得。一张脸蛋嘛，
却是钉鞋踏烂泥，翻转石榴皮，格老子好一张大麻皮！\n");
	else say("贾人达白了白眼：格老子的，你这兔儿爷骂谁？\n");
        return;
}
