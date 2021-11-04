#include <ansi.h>
inherit NPC;
inherit F_DEALER;

void create()
{
        set_name("绯胭", ({ "fei yan", "fei", "yan" }));
    set("nickname", HIM "八音狐仙" NOR);
        set("title", "老板娘");
    set("long", @LONG
绯胭原本在青楼以卖唱为生，因为被逼无奈，误杀县老
爷的公子，险被处死，后来据说她被狐仙所救，从此隐
姓埋名，做起这乐器的买卖。还有的说她本身就是狐仙
所化，又由于她的一曲《恋八音》，所以人人都称她为
「八音狐仙」。
LONG);
        set("shen_type", 1);
        set("gender", "女性");
        set("age", 25);
    set("per", 28);
        set_skill("unarmed", 200);
        set_skill("dodge", 200);
        set_temp("apply/damage", 25);
        set("combat_exp", 800000);
    set("no_get", "1");
        set("attitude", "friendly");
        set("vendor_goods", ({
        "/d/hengyang/yueqi/shixuanqin-zhanguo",
        "/d/hengyang/yueqi/jiuxiaoqin",
        "/d/hengyang/yueqi/zhongnishi",
        "/d/hengyang/yueqi/jiaoyeqin",
        "/d/hengyang/yueqi/qin-jueyin",
        "/d/hengyang/yueqi/qin-konggu",
        "/d/hengyang/yueqi/qin-jimo",
        "/d/hengyang/yueqi/qin-tianlai",
        "/d/hengyang/yueqi/huqin",
        "/d/hengyang/yueqi/zhuxiao",
        "/d/hengyang/yueqi/honghuqin",
        "/d/hengyang/yueqi/zhuxiao-youlan",
        "/d/hengyang/yueqi/zhuxiao-shuiyun",
        "/d/hengyang/yueqi/zhuxiao-liuquan",
        "/d/hengyang/yueqi/zhuxiao-qingyin",
        "/d/hengyang/yueqi/yuepu-book",
        "/d/hengyang/yueqi/yueqi-book",
        "/d/hengyang/yueqi/huxian-book",
        }));

    set("inquiry", ([
         "杜凤鄂" : "杜公子，他还好吗？\n",
    ]));

        setup();
        carry_object("/d/hengyang/npc/obj/female-shoe")->wear();
    carry_object("/d/hengyang/npc/obj/female1")->wear();

}

void init()
{
    object ob;

    ob = this_player();

    ::init();
    if (interactive(ob) && ! is_fighting())
    {
        remove_call_out("greeting");
        call_out("greeting", 2, ob);
    }

    add_action("do_buy", "buy");
    add_action("do_list", "list");
}

void greeting(object ob)
{
    if (! ob || environment(ob) != environment()) return;

    say(CYN "绯胭笑着说道：这位" + RANK_D->query_respect(ob)+ "这里"
        "各种乐器应有尽有，请随便看看。\n" NOR);

    return;
}
