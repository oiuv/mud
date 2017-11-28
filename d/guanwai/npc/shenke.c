#include <ansi.h>
inherit NPC;

mixed ask_me();

void create()
{
        set_name("参客", ({ "shen ke", "shen", "ke" }));
        set("long", "他是一个参客，常年在关外经营，颇为富有。\n");
        set("age", 65);
        set("combat_exp", 300);
        set("str", 30);
        set("dex", 30);
        set("con", 30);
        set("int", 30);
        set("attitude", "friendly");
        set("inquiry", ([
                "入关" : (: ask_me :),
                "回去" : (: ask_me :),
        ]));
        setup();
        set("startroom", "/d/beijing/majiu");
        carry_object("/clone/misc/cloth")->wear();
}

mixed ask_me()
{
        object ob, me;
        me = this_player();

        if ((string)me->query("family/family_name") != "关外胡家")
                return "你是谁？请问我认识你么？";

        if (find_object(query("startroom")) != environment())
                return "我这里还有事，你就自己走回去吧。";

        command("hehe");
        command("say 既然是平四爷朋友的事，我怎么可能不帮？");

        message_sort(HIC "\n便见参客指着$N" HIC "对马夫道「这是我"
                     "朋友，现在要回关外，你找个伙计送他，路费伙食"
                     "全部由我担负，一切以三倍计算。」马夫听后立忙"
                     "连声称是，将$N" HIC "送上马车，绝尘而去。\n"
                     "\n" NOR, me);

        ob = load_object("/d/guanwai/xiaoyuan");
        ob = find_object("/d/guanwai/xiaoyuan");
        me->move("/d/guanwai/xiaoyuan");

        message("vision", HIC "\n远处一辆马车急驶而来，车门一开" +
                          me->query("name") + HIC "从里面钻了出"
                          "来。\n\n" NOR, environment(me), ({me}));

        tell_object(me, CYN "\n马夫笑道：这位" + RANK_D->query_respect(me) +
                        CYN "已经到了，请下车吧。\n\n" NOR );
        return 1;

}
