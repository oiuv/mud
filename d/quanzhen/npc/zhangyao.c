#include <ansi.h>
inherit NPC;

void create()
{
        set_name("掌药道长", ({ "zhangyao daozhang", "zhangyao", "daozhang" }));
        set("gender", "男性");
        set("age", 28);
        set("class", "taoist");
        set("long", @LONG
这是全真教中的掌管所有药物的道人。他年纪
不大，但看起来显得少年老成。
LONG);
        set("attitude", "friendly");
        set("shen_type",1);
        set("str", 21);
        set("int", 22);
        set("con", 23);
        set("dex", 22);

        set("qi", 600);
        set("max_qi", 600);
        set("jing", 400);
        set("max_jing", 400);
        set("neili", 1200);
        set("max_neili", 1200);
        set("jiali", 0);

        set("combat_exp", 30000);
        set("score", 20000);

        set_skill("force", 60);
        set_skill("quanzhen-xinfa", 50);
        set_skill("sword", 60);
        set_skill("quanzhen-jian",60);
        set_skill("dodge", 50);
        set_skill("jinyan-gong", 50);
        set_skill("parry", 60);
        set_skill("unarmed",60);
        set_skill("strike",60);
        set_skill("haotian-zhang", 50);
        set_skill("literate",50);
        set_skill("taoism",40);

        map_skill("force", "quanzhen-xinfa");
        map_skill("sword", "quanzhen-jian");
        map_skill("dodge", "jinyan-gong");
        map_skill("parry", "quanzhen-jian");
        map_skill("strike", "haotian-zhang");
        prepare_skill("strike", "haotian-zhang");

        create_family("全真教", 4, "弟子");

        set("inquiry", ([
                "全真教" :  "我全真教是天下道家玄门正宗。\n",
        ]) );

        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object(__DIR__"obj/grayrobe")->wear();

}

int accept_object(object who, object ob)
{
        object obj;
        object me = this_player();

        if (! who || environment(who) != environment())
		return 0;

        if (! objectp(ob))
		return 0;

        if (! present(ob, who))
                return notify_fail("你没有这件东西。\n");

        if ((string)ob->query("id") != "gui jia"
           && ob->query("id") != "fu ling")
                return notify_fail(CYN "掌药道长摇头道：这不是配药的材料。\n" NOR);

        if ((string)ob->query("id") == "gui jia")
        {
                if (query_temp("fuling"))
                {
                        obj = new(__DIR__"obj/gao");
                        obj->move(this_object());

                        write(CYN "掌药道长接过龟甲，说道：龟甲和茯苓都有了，这"
                              "副龟苓膏可炼成了。\n" NOR);
                        command("give guiling gao to " + who->query("id"));

                        delete_temp("guijia");
                        delete_temp("fuling");
                        destruct(ob);
                        return 1;
                } else
                {
                        if(query_temp("guijia"))
                        {
                                write(CYN "掌药道长摇了摇头，说道：这龟甲我已经"
                                      "有了。\n" NOR);
                                return 0;
                        } else
                        {
                                set_temp("guijia", 1);
                                write(CYN "掌药道长接过龟甲，笑道：龟甲有了，就"
                                      "缺茯苓了。\n" NOR);
                                destruct(ob);
                                return 1;
                        }
                }
        }
        if (ob->query("id") == "fu ling")
        {
                if(query_temp("guijia"))
                {
                        obj = new(__DIR__"obj/gao");
                        obj->move(this_object());

                        write(CYN "掌药道长接过龟甲，说道：龟甲和茯苓都有了，这"
                              "副龟苓膏可炼成了。\n" NOR);
                        command("give guiling gao to " + who->query("id"));

                        delete_temp("guijia");
                        delete_temp("fuling");
                        destruct(ob);
                        return 1;
                } else
                {
                        if(query_temp("fuling"))
                        {
                                write(CYN "掌药道长摇了摇头，说道：这茯苓我已经"
                                      "有了。\n" NOR);
                                return 0;
                        } else
                        {
                                set_temp("fuling", 1);
                                write(CYN "掌药道长接过茯苓，笑道：茯苓有了，就"
                                      "缺龟甲了。\n" NOR);
                                destruct(ob);
                                return 1;
                        }
                }
        }

}
