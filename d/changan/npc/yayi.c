//yayi.c

#include <ansi.h>

inherit NPC;

string *first_name = ({ "赵","钱","孙","李","周","吴","郑","王","张","陈",
                        "刘","林" });
string *name_words = ({ "顺","昌","振","发","财","俊","彦","良","志","忠",
                        "孝","雄","益","添","金","辉","长","盛","胜","进",
                        "安","福","同","满","富","万","龙","隆","祥","栋",
                        "国","亿","寿" });

varargs void drool(string msg, string who);

void create()
{
        string name/*, id*/;
        name = first_name[random(sizeof(first_name))];
        name += name_words[random(sizeof(name_words))];
        name += name_words[random(sizeof(name_words))];
        set_name(name, ({"yayi"}));
	set("title", "衙役");
        set("gender", "男性");
	set("str", 25+random(10));
        set("age", 20+random(10));
        set("attitude", "peaceful");
        set("combat_exp", 40000);
        set_skill("unarmed", 50);
        set_skill("dodge", 50);
        set_skill("parry", 40);
	set_skill("staff", 40);
	set("max_qi", 500);
	set("max_jing", 500);
	set("max_neili", 300);
	set("neili", 300);
	set("jiali", 10);
	set("max_jingli", 300);
	set("jingli", 300);

        setup();
        carry_object(__DIR__"obj/yayifu")->wear();
        carry_object(__DIR__"obj/shawei")->wield();
}

int accept_fight(object me)
{
        command("say 哼！长安府你也敢来闹事，看打！\n");
        return 1;
}