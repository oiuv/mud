//shiwei.c

#include <ansi.h>

inherit NPC;

string *first_name = ({ "赵","钱","孙","李","周","吴","郑","王","樊","陈","祝","魏","蒋","沈",
                        "韩","杨", "刘","张","林","朱","欧阳","司马","慕容","诸葛" });
string *name_words = ({ "顺","昌","振","发","财","俊","彦","良","志","忠","孝","雄","益","添",
                        "金","辉","长","盛","胜","进","安","福","同","满","富","万","龙","隆",
                        "祥","栋","国","亿","寿","思","霖","雷","鹏","平","轼","甫","维","龄",
                        "桥","溪","声","谷","山","舟","岩","泉","游","逊", });
        
void create()
{
        string name;
        name = first_name[random(sizeof(first_name))];
        name += name_words[random(sizeof(name_words))];
        if (random(10) > 2) name += name_words[random(sizeof(name_words))];
        set_name(name, ({"shi wei","shi","wei"}));
        set("long",
                "这是位守护皇宫的带刀侍卫，身穿劲装，手持钢"
                "刀。他双目精光炯炯，警惕地巡视着四周的情形。\n");
        set("title", HIR"二品带刀侍卫"NOR);
        set("age", 25);
        set("combat_exp", 200000);
        set("attitude", "heroism");
        set("str", 25);
        set("max_qi", 1000);
	set("max_jing", 1000);
        set("neili", 500);
        set("max_neili", 500);
        set("jiali", 30);
        set_skill("blade", 100);
        set_skill("unarmed", 100);
        set_skill("parry", 100);
        set_skill("dodge", 100);
	set_skill("force", 100);
        setup();

        carry_object(__DIR__"obj/blade")->wield();
        carry_object(__DIR__"obj/jinzhuang")->wear();
}
