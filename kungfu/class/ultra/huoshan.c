// huoshan 霍山

#include <ansi.h>

inherit NPC;
inherit F_MASTER;
inherit F_NOCLONE;

mixed ask_opinion();

#define ULTRA_OPINION   "宗师"
#define OPINION_TYPE    HIY "内家功夫" NOR 
#define MY_OPINION      "force"

string  *my_opinions = ({ "force" });

// 该头文件必须在这里嵌入
#include "ultra.h"

void create()
{
        set_name("霍山", ({ "huo shan", "huo", "shan" }) );
        set("title", HIW "大宗师" NOR);
        set("gender", "男性");
        set("age", 91);
        set("long", "他身着奇装异服，相貌平平，便似一般的西域人士。\n");
        set("attitude", "peaceful");
        set("class", "fighter");
        set("str", 30);
        set("int", 37);
        set("con", 39);
        set("dex", 33);

        set("max_qi", 20000);
        set("max_jing", 20000);
        set("neili", 30000);
        set("max_neili", 30000);
        set("jiali", 100);

        set("combat_exp", 50000000);

        set("inquiry", ([
                "乾坤大挪移" : "嘿，这东西乃是我中年时所创，算不得什么。",
                "评价"     : (: ask_opinion :),
                "opinion"  : (: ask_opinion :),
                "武学修养" : "好好提高自己的武学修养(martial-cognize)，到时候什么武功都如小儿科！",
        ]));

        set_skill("unarmed", 500);
        set_skill("parry", 500);
        set_skill("dodge", 500);
        set_skill("force", 500);
        set_skill("sword", 500);
        set_skill("jiuyang-shengong", 500);
        set_skill("qiankun-danuoyi", 500);
        set_skill("martial-cognize", 500);
        set_skill("literate", 220);

        map_skill("parry", "qiankun-danuoyi");
        map_skill("force", "jiuyang-shengong");
        map_skill("dodge", "qiankun-danuoyi");
        map_skill("unarmed", "jiuyang-shengong");
        map_skill("sword", "jiuyang-shengong");

        prepare_skill("unarmed", "jiuyang-shengong");

        set("opinion/ultra",  1);
        set("opinion/master", 1);

        set("rank_info/self", "本座");

        setup();
        carry_object("/clone/cloth/cloth")->wear();

        set("startroom", "/d/mingjiao/xuantianshi");
        check_clone();
}

void init()
{
        object me;

        if (! interactive(me = this_player()))
                return;

        me->delete_temp("want_opinion");
        if (ultrap(me))
                message_vision(CYN "$N" CYN "眉头一皱，哼了一声。\n"
                               NOR, this_object(), me);
}

mixed ask_opinion()
{
        object me;
        object ob;

        me = this_player();

        if (me->query("combat_exp") < 200000)
                return "哼！你这点武功也出来丢人现眼？";

        if (me->query("opinion/" MY_OPINION) == ULTRA_OPINION)
                return "不必了，你内功方面的修为已经称得上是宗师了！";

        if (is_fighting(me))
                return "哈哈，废什么话，打赢了我，你自己给自己评价吧！";

        if (me->is_fighting())
                return "你等会儿吧！待我赶走他们。";

        if (objectp(ob = query_temp("opinion")))
        {
                if (ob == me)
                {
                        command("say 你着什么急？不要烦我。");
                        return 1;
                }

                message_vision(CYN "$N" CYN "颇为恼怒的对$n" CYN
                               "道：“没看我正忙着吗？”\n" NOR,
                               this_object(), me);
                return 1;
        }

        switch(me->query_temp("want_opinion/shenni"))
        {
        case 0:
                command("say 好吧，咱们过一招，比拚一下内力。");
                break;
        case 1:
                command("say 你准备好没有？好了就来吧。");
                break;
        case 2:
                message_vision(CYN "$N" CYN "皱眉对$n" CYN
                               "道：“我看你这人是够罗嗦的。”\n" NOR,
                               this_object(), me);
                break;
        case 3:
                command("say 快给我闭上你的鸟嘴！");
                return 1;
        }

        me->add_temp("want_opinion/shenni", 1);
        return 1;
}

int calc_level(object me, string skill)
{
        int lvl;
        string sp;

        lvl = me->query_skill(skill, 1) / 2;
        sp = me->query_skill_mapped(skill);
        if (! sp) return lvl;

        lvl += me->query_skill(sp, 1);
        if (me->query("max_neili") > 4000) lvl += 20;
        return lvl;
}

void do_congration(object me)
{
        command("chat 不错，不错，真是不错。");
}

int accept_hit(object me)
{
        command("sneer");
        command("say 好你个" + RANK_D->query_rude(me) + "，你找死找到这来了！");
        kill_ob(me);
        return 1;
}

int accept_fight(object me)
{
//      object weapon;

        if (me->query("opinion/" MY_OPINION) == ULTRA_OPINION)
        {
                message_vision(CYN "$N" CYN "对$n" CYN "道：“很"
                               "好，你也算是宗师高手了，来吧！咱"
                               "们比划一下！”\n" NOR,
                               this_object(), me);
                return 1;
        }

        if (! me->query_temp("want_opinion/shenni"))
        {
                command("say 你干什么要和我动手？");
                return 0;
        }

        command("look " + me->query("id"));

        COMBAT_D->do_attack(this_object(), me, 0);

        if (me->query("qi") <= 0)
        {
                message_vision(CYN "\n$N" CYN "摇摇头对$n" CYN
                               "道：“你现在的武功还差得远，连"
                               "我一招都接不住！”\n" NOR,
                               this_object(), me);
                return notify_fail("看来要好好的修炼功夫了。\n");
        }

        message_combatd(HIC "$N" HIC "右掌伸出，正和$n" HIC "手"
                        "掌相对，两人同时运起内力，不一会儿只见"
                        "二人头上生起腾腾雾气。\n忽然$N" HIC "手"
                        "掌一撤、收回功力，没有一点阻滞，不禁让"
                        "$n" HIC "大为愕然。\n" NOR, this_object(),
                        me);
        if (me->query("neili") < 3000)
        {
                message_vision(CYN "\n$N" CYN "摇摇头对$n" CYN
                               "道：“适才你内力不足，我难以衡"
                               "量，待你将内力修炼好了再来吧！"
                               "”\n" NOR, this_object(), me);
                return notify_fail("看来还是回去锻炼一下内力吧！\n");
        }
        me->set("neili", 0);
        

        call_out("check_opinion", 2, me);
        set_temp("opinion", me);
        me->delete_temp("want_opinion");
        message_vision(CYN "\n$N" CYN "一摆手道：“好了，待我想"
                       "想。”\n" NOR, this_object(), me);
        return notify_fail("看来不能心急，还得等一会儿。\n");
}

int accept_kill(object me)
{
        if (me->query("combat_exp") < 500000)
        {
                message_vision(CYN "$N" CYN "大怒道：“无名小辈捣"
                               "什么乱？给我滚！”说罢一掌把$n" CYN
                               "劈倒在地。\n" NOR, this_object(), me);
                me->unconcious();
                return -1;
        }
        command("sigh");
        command("say 很好！近年还真没有遇到什么敢和我较量的高手！");
        return 1;
}

void unconcious()
{
        message("vision", "\n"HIR + name() + "脸色一变，吐了一口鲜"
                "血，身形一闪，消逝不见。\n\n" NOR, environment());
        command("chat 罢！罢！罢！本座去也！");
        destruct(this_object());
}

void die()
{
        message("vision", "\n"HIR + name() + "大叫一声，狂吐了一口鲜"
                "血，身形一闪，就此不见。\n\n" NOR, environment());
        command("chat 本座去也！");
        destruct(this_object());
}