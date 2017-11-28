#include <ansi.h>
inherit NPC;

string ask_me();

void create()
{
        set_name("掌经道长", ({ "zhangjing daozhang", "zhangjing", "daozhang" }));
        set("long", @LONG
这位是全真教里掌管经书的道长。他以前是长
安镇上一个私塾的夫子，因为仰慕大道，才拜
到了全真门下。不过毕竟因为年岁大了，功夫
的根基扎得不牢，这也正合他意，可以安安心
心地研读经书了。
LONG);

        set("gender", "男性");
        set("age", 36);
        set("class", "taoist");
        set("attitude", "friendly");
        set("shen_type",1);
        set("str", 18);
        set("int", 18);
        set("con", 20);
        set("dex", 21);

        set("qi", 500);
        set("max_qi", 500);
        set("jing", 350);
        set("max_jing", 350);
        set("neili", 900);
        set("max_neili", 900);
        set("jiali", 0);

        set("combat_exp", 20000);
        set("score", 15000);

        set_skill("force", 40);
        set_skill("quanzhen-xinfa", 40);
        set_skill("sword", 40);
        set_skill("quanzhen-jian",40);
        set_skill("dodge", 50);
        set_skill("jinyan-gong", 40);
        set_skill("parry", 50);
        set_skill("unarmed",50);
        set_skill("strike",50);
        set_skill("haotian-zhang", 50);
        set_skill("literate",100);
        set_skill("taoism",80);

        map_skill("force", "quanzhen-xinfa");
        map_skill("sword", "quanzhen-jian");
        map_skill("dodge", "jinyan-gong");
        map_skill("parry", "quanzhen-jian");
        map_skill("strike", "haotian-zhang");
        prepare_skill("strike", "haotian-zhang");

        create_family("全真教", 4, "弟子");

        set("book_count",1);
        set("inquiry", ([
                "全真教" : "我全真教是天下道家玄门正宗。\n",
                "道德经" : (: ask_me :),
        ]) );

        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object(__DIR__"obj/grayrobe")->wear();

}

string ask_me()
{
        mapping fam;
        object ob;

        if (! (fam = this_player()->query("family"))
           || fam["family_name"] != "全真教")
                return "阁下与本教毫无瓜葛，你这话可叫我弄不明白了。";

        if (query("book_count") < 1)
                return "你来晚了，道德经已经被人取走了。";

        add("book_count", -1);
        ob = new(__DIR__"obj/daodejing-i");
        ob->move(this_player());
        return "好吧，这本「道德经」你拿去好好研读，不懂的地方可以来问我。";

}
