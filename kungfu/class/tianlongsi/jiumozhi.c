//火焰刀 解密 鸠摩智
#include <ansi.h>
#define MIJI "/clone/lonely/book/liumai-shenjian"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;

mixed ask_me();
mixed ask_skill();

void create()
{
        set_name("鸠摩智", ({ "jiumo zhi", "zhi" ,"ming wang"}));
        set("nickname", HIG "大轮明王" NOR);
        set("long",@LONG
他就是雪山寺的掌门，人称大轮明王的鸠摩智。他对佛法有精深的研究。
身穿一件大红袈裟，头带僧帽。
LONG
        );
        set("title","雪山寺掌门");
        set("gender", "男性");
        set("age", 60);
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 32);
        set("int", 40);
        set("con", 31);
        set("dex", 31);

        set("qi", 6000);
        set("max_qi", 6000);
        set("jing", 3000);
        set("max_jing", 3000);
        set("neili", 8000);
        set("max_neili", 8000);
        set("jiali", 200);
        set("combat_exp", 4000000);
        set("score", 40000);

        set_skill("force", 260);
        set_skill("xiaowuxiang", 260);
        set_skill("mizong-neigong", 260);
        set_skill("dodge", 260);
        set_skill("shenkong-xing", 260);
        set_skill("parry", 260);
        set_skill("unarmed", 260);
        set_skill("sword", 260);
        set_skill("mingwang-jian", 260);
        set_skill("hammer", 260);
        set_skill("dali-chu", 260);
        set_skill("xiangmo-chu", 260);
        set_skill("lamaism", 260);
        set_skill("literate", 260);
        set_skill("strike", 600 );
        set_skill("huoyan-dao", 260);
        set_skill("cuff", 260);
        set_skill("yujiamu-quan", 260);
        set_skill("hand", 260);
        set_skill("dashou-yin", 260);
        set_skill("martial-cognize", 260);
        set_skill("longxiang-gong", 260);

        map_skill("force", "xiaowuxiang");
        map_skill("dodge", "shenkong-xing");
        map_skill("parry", "huoyan-dao");
        map_skill("sword", "mingwang-jian");
        map_skill("strike", "huoyan-dao");
        map_skill("cuff", "yujiamu-quan");
        map_skill("hammer", "xiangmo-chu");

        prepare_skill("strike", "huoyan-dao");
        prepare_skill("cuff", "yujiamu-quan");

        create_family("密宗", 1, "掌门");
        set("class", "bonze");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                //(: perform_action, "strike.fen" :),
                //(: perform_action, "strike.yan" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }) );

        set("inquiry", ([
                "焚身" : (: ask_me :),
                "天寰神炎" : (: ask_skill :),
        ]));

        setup();

        carry_object("/d/xueshan/obj/r-jiasha")->wear();
        carry_object("/d/xueshan/obj/sengmao")->wear();

        add_money("silver",50);
}

mixed ask_me()
{
        object me;

        me = this_player();
        if(me->query("can_perform/huoyan-dao/fen"))
                return "绝技你已经学会了，剩下的就要靠你自己多练习了。";

        if (me->query_skill("huoyan-dao", 1) < 180)
                return "你的火焰刀法修为还不够，等你练好了再说吧！";

        if (me->query("shen") > -65000 )
                return "你为人太过心软，这招暂时还不能传你。";

        if(me->query("gongxian") < 600 )
                return "你的贡献还不够，这招暂时还不能传你。";

        message_vision(HIC "$n" HIC "右掌一竖，几路无形刀气袭击向$N"
                       HIC "，$N" HIC "连忙伸手格挡，不禁发现$n"
                       HIC "的内力运用可谓是奥妙无穷！\n" NOR,
                       me, this_object());
        command("simle");
        tell_object(me, HIG "你通晓了焚身的奥妙。\n" NOR);
        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("huoyan-dao"))
                me->improve_skill("huoyan-dao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/huoyan-dao/fen", 1);
        me->add("gongxian", -600);
        return 1;
}

mixed ask_skill()
{
        object me;

        me = this_player();

        if (me->query("can_perform/huoyan-dao/yan") )
                return "你又来干什么？自己下去多练。";

        if (me->query("gongxian") < 1200 )
                return "你的贡献还不够，这招暂时还不能传你。";

        if (me->query("shen") > -120000 )
                return "你为人太过心软，这招暂时还不能传你。";

        if (me->query_skill("force") < 220)
                return "你的内功修为不足，还学不了这一招。";

        if (me->query("max_neili") < 5000 )
                return "你的内力修为不足，还是修炼高点再来吧。";

        if (me->query_skill("huoyan-dao", 1) < 220)
                return "等你把火焰刀练熟了再来找我。";

        message_sort(HIY "\n$n" HIY "对$N" HIY "点了点头，喝道：“瞧仔"
                     "细了。”话音刚落，只见$n" HIY "高举手中的刚刀，在"
                     "空中挥舞成盘，气势惊人！便在此时，那柄刚刀已携带"
                     "着震天撞击之声猛然击落。直把$N" HIY "看得目瞪口呆"
                     "。\n\n" NOR, me, this_object());

        command("nod");
        command("say 看明白了就自己下去练吧。");
        tell_object(me, HIC "你学会了「天寰神炎」。\n" NOR);

        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("huoyan-dao"))
                me->improve_skill("huoyan-dao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/huoyan-dao/yan", 1);
        me->add("gongxian", -1200);

        return 1;
}
int accept_object(object who, object ob)
{
        object me;
        me = this_player();

        if (base_name(ob) != MIJI)
        {
                command("say 你给我这个干啥？");
                return -1;
        }

        if (me->query_skill("huoyan-dao", 1))
        {
            command("say 我已经没什么可教给你了，还来凑什么热闹？");
            return -1;
        }

        if (me->query("family/family_name") == "雪山派")
        {
            me->add("skybook/tianlong/jiumozhi", 8);
            command("say 原来是我雪山的后辈！");
        }

        if (me->add("skybook/tianlong/jiumozhi", 1 + random(6)) < 10)
        {
            command("say 谢谢施主送来的六脉剑谱。");
            command("heihei");
        }else
        {
            command("haha");
            tell_object(who, HIC "\n鸠摩智同意传授你「火焰刀」。\n" NOR);
            me->set_skill("huoyan-dao", 10);
        }

        destruct(ob);
        return 1;
}
