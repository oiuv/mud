#include <ansi.h>
inherit NPC;

void create()
{
        set_name("掌园道长", ({ "zhangyuan daozhang", "zhangyuan", "daozhang" }));
        set("long", @LONG
他本是服侍重阳祖师的道徒，现在他年纪大了。
重阳祖师见他忠心耿耿，就分配他一个闲差到
小花园来打理花木。
LONG);
        set("gender", "男性");
        set("age", 52);
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
        set_skill("unarmed", 50);
        set_skill("strike", 50);
        set_skill("haotian-zhang", 50);
        set_skill("literate", 40);
        set_skill("taoism", 30);

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
        ]) );

        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object(__DIR__"obj/grayrobe")->wear();

}
