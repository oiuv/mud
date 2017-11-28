#include <ansi.h>

inherit NPC;
inherit F_GUARDER;

mixed ask_me();

void create()
{
        set_name("平四", ({ "ping si", "ping", "si" }));
        set("gender", "男性");
        set("age", 65);
        set("title", "胡家仆佣");
        set("long", "他是胡家忠心耿耿的仆役。\n");
        set("attitude", "peaceful");
        set("str", 20);
        set("int", 20);
        set("con", 24);
        set("dex", 20);

        set("max_qi", 4000);
        set("max_jing", 1000);
        set("neili", 3000);
        set("max_neili", 3000);
        set("combat_exp", 150000);

        set_skill("force", 40);
        set_skill("blade", 40);
        set_skill("dodge", 40);
        set_skill("parry", 40);
        set_skill("unarmed", 40);

        create_family("关外胡家", 0, "仆佣");

        set("inquiry",([
        	"阎基"   : "阎基…哼…这个狗贼。",
                "胡一刀" : "那……那是老主人，唉。",
                "苗人凤" : "苗大侠可不是坏人。",
                "赵半山" : "他对我家主人的交情那是没得说的。",
                "出关"   : (: ask_me :),
                "办事"   : (: ask_me :),
                "出去"   : (: ask_me :),
        ]));
        set("coagents", ({
                ([ "startroom" : "/d/guanwai/xiaowu",
                   "id"        : "hu fei" ]),
        }));

        setup();
        set("startroom", "/d/guanwai/xiaoyuan");
        carry_object("/clone/cloth/cloth")->wear();
}

mixed ask_me()
{
        object ob, me;
        me = this_player();

        if ((string)me->query("family/family_name") != "关外胡家")
                return "你自己没长腿么？";

        if (find_object(query("startroom")) != environment())
                return "我这里还有事，你就自己走回去吧。";

        command("nod");
        command("say 要出去办事么？那我叫几个朋友送你一程吧。");

        message_sort(HIC "\n平四朝远方一招手，顿时几个参客赶着马车驶了"
                     "过来。平四笑道「我家小主人要出关办点事，今趟就劳"
                     "驾你们送送。」参客听后连忙陪笑着答应，$N" HIC "见"
                     "状急忙钻进车中，只听一阵清脆的鞭响，马车绝尘而去"
                     "。\n\n" NOR, me);

        ob = load_object("/d/beijing/majiu");
        ob = find_object("/d/beijing/majiu");
        me->move("/d/beijing/majiu");

        message("vision", HIC "\n远处一辆马车急驶而来，车门一开" +
                          me->query("name") + HIC "从里面钻了出"
                          "来。\n\n" NOR, environment(me), ({me}));

        tell_object(me, CYN "\n参客笑道：这位" + RANK_D->query_respect(me) +
                        CYN "已经到了，请下车吧。\n参客说道：我要"
                        "在这里办些事情，如果打算" HIC "入关" NOR +
                        CYN "的话，我还可以找人送你。\n\n" NOR);
        return 1;

}
