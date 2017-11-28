#include <ansi.h>
inherit NPC;

string ask_for_zigong();
int ask_for_gongzi();

void create()
{
        set_name("海公公", ({"hai gonggong", "hai", "gonggong"}));
        set("title", HIR "东厂千户" NOR);
        set("long", "他是东厂大太监海大富，长得既像老"
                    "头又像老太太。\n"
        );
        set("gender", "无性");
        set("rank_info/respect", "公公");
        set("attitude", "heroism");
        set("class", "eunach");

        set("inquiry",([
                "自宫"    : (: ask_for_zigong :),
                "zigong"  : (: ask_for_zigong :),
        ]));

        set("age", 60);
        set("shen_type", -1);
        set("str", 25);
        set("int", 20);
        set("con", 20);
        set("dex", 25);
        set("max_qi", 2000);
        set("max_jing", 1000);
        set("neili", 2500);
        set("max_neili", 2500);
        set("jiali", 100);
        set("combat_exp", 150000);
        set("score", 100);
        set("apply/attack",  100);
        set("apply/defense", 100);

        set_skill("force", 120);
        set_skill("unarmed", 120);
        set_skill("sword", 120);
        set_skill("dodge", 120);
        set_skill("parry", 120);
        set_skill("pixie-jian", 120);

        map_skill("dodge", "pixie-jian");
        map_skill("sword", "pixie-jian");
        map_skill("unarmed", "pixie-jian");
        map_skill("parry", "pixie-jian");

        setup();

        carry_object(__DIR__"obj/sword5")->wield();
        carry_object(__DIR__"obj/cloth3")->wear();
        add_money("silver", 50);
}

void init()
{
        add_action("do_decide", "decide");
}

string ask_for_zigong()
{
        object me;

        me = this_player();

        if ((string)me->query("gender") == "无性")
                return "你我同是阉人，何必开如此无聊的玩笑？\n";

        if ((string)me->query("gender") == "女性")
                return "我虽已废，但一样可以给你这个小美人带来快乐，要不要试试？\n";

        if ((int)me->query("age") > 30)
                return "你要进宫怎么不早点来？活了大半辈子才自宫这我倒是第一次听说。\n";

        if ((int)me->query_str() > 30)
                return "这位好汉过于粗壮，自宫有碍观瞻，不妥，不妥。\n";

        me->set_temp("pending/zigong", 1);
                return "自宫？这位公子相貌堂堂，何必... 我真希望能有你的那个。\n"
                       "海公公接着道：自宫之后，不可后悔，你若决心已定" HIR "(de"
                       "cide)" NOR + CYN "就告诉我。\n" NOR;
}

int do_decide()
{
        object me;

        me = this_player();
        if (! me->query_temp("pending/zigong"))
                return 0;

        message_vision(HIC "海大富叹了口气，道：既然这样……小桂子，过来帮我给这"
                       "位" HIC + RANK_D->query_respect(me) + HIC "净身。\n海公公"
                       "对$N" HIC "说道：好吧，你躺到案板上去，我这就要开始了。\n"
                       "\n$N" HIC "一咬牙，躺上案板，褪下了中衣。\n\n" NOR + HIR
                       "$n" HIR "摇了摇头，伸出长剑插到$N" HIR "两腿之间，飞速一"
                       "剜………\n\n$N" HIR "顿时惨叫一声昏了过去……\n\n" NOR,
                       this_player(), this_object());

        command("chat 东厂海大富今日为" + me->name(1) + "净身，行下入宫之礼。");

        me->delete_temp("pending/zigong");
        me->set("gender","无性");
        me->set("class", "eunach");
        me->add("combat_exp", 1000);
        me->unconcious();
        return 1;
}

