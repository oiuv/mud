#include <ansi.h>

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();

void create()
{
        set_name("霍青桐", ({ "huo qingtong", "huo", "qingtong" }));
        set("long", @LONG
这女郎秀美中透着一股英气，光采照人，当真
丽若春梅绽雪，神如秋蕙披霜，两颊融融，霞
映澄塘，双目晶晶，月射寒江。腰插匕首，长
辨垂肩，鹅黄衫子，头戴金丝绣的小帽，帽边
插了根长长的翠绿羽毛，革履青马，旖旎如画。
LONG);
        set("nickname", HIG "翠羽黄衫" NOR);
        set("gender", "女性");
        set("class", "swordsman");
        set("age", 18);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("per", 30);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
        
        set("max_qi", 2800);
        set("max_jing", 1500);
        set("neili", 2500);
        set("max_neili", 2500);
        set("jiali", 150);
        set("combat_exp", 800000);

        set_skill("force", 180);
        set_skill("zhanshen-xinjing", 100);
        set_skill("tianchi-neigong", 180);
        set_skill("dodge", 180);
        set_skill("yanzi-chuanyun", 160);
        set_skill("zhuangzi-wu", 180);
        set_skill("parry", 160);
        set_skill("sword", 180);
        set_skill("sanfen-jianshu", 180);
        set_skill("hand", 160);
        set_skill("yunlong-shou", 160);
        set_skill("claw", 160);
        set_skill("yunlong-zhua", 160);
        set_skill("martial-cognize", 160);
        set_skill("literate", 200);
        set_skill("muslim", 300);

        map_skill("force", "tianchi-neigong");
        map_skill("dodge", "zhuangzi-wu");
        map_skill("hand", "yunlong-shou");
        map_skill("parry", "sanfen-jianshu");
        map_skill("claw", "yunlong-zhua");
        map_skill("sword", "sanfen-jianshu");

        prepare_skill("hand", "yunlong-shou");
        prepare_skill("claw", "yunlong-zhua");

        create_family("天山派", 16, "传人");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.haishi" :),
                (: perform_action, "dodge.hua" :),
                (: exert_function, "recover" :),
        }));

        set("inquiry", ([
                "海市蜃楼" : (: ask_skill1 :),
        ]));

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();
        carry_object(__DIR__"obj/cuiyu")->wear();
        carry_object(__DIR__"obj/huangshan")->wear();
        carry_object(__DIR__"obj/shortsword")->wield();
}

mixed ask_skill1()
{
        object me;

        me = this_player();
        if (me->query("can_perform/sanfen-jianshu/haishi"))
                return "咦？你不是已经会了吗？";

        if (!me->query("story/sanfenjian"))
                return "你这是什么意思？";

        if (me->query_skill("sanfen-jianshu", 1) < 150)
                return "你的三分剑术还不到家，要多练练！";

        message_vision(HIY "$n" HIY "点了点头，拔出手中" NOR +
                       HIC "短剑" NOR + HIY "，突然圈转，一"
                       "招之中另蕴涵三招，招式繁复狠辣，剑"
                       "招虚虚\n实实，正是三分剑术的独得之秘"
                       "——「海市蜃楼」。\n" NOR,
                       me, this_object());
        command("nod");
        command("say 你可明白了？");
        tell_object(me, HIC "你学会了「海市蜃楼」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 350000);
        if (me->can_improve_skill("sanfen-jianshu"))
                me->improve_skill("sanfen-jianshu", 350000);
        me->set("can_perform/sanfen-jianshu/haishi", 1);
        return 1;
}

int recognize_apprentice(object me, string skill)
{
        if (skill != "muslim")
        {
                command("say 找你师父去，别来烦我。");
                return -1;
        }

        if (! me->query_temp("can_learn/huoqingtong"))
        {
                command("sigh");
                command("say 我就教你一些回文，假如你哪时见到"
                        "红…唉，还是算了吧。");
                me->set_temp("can_learn/huoqingtong", 1);
        }

        return 1;
}

void unconcious()
{
        die();
}

