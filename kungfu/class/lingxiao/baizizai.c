#include <ansi.h>
#include "lingxiao.h"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;

mixed ask_skill1();
mixed ask_skill2();

void create()
{
        set_name("白自在", ({"bai zizai", "bai", "zizai"}));
        set("nickname", HIY "威德先生" NOR);
        set("long", "他就是凌宵城城主，雪山剑派的掌门人，江湖人称威\n"
                    "德先生的百自在。相传他年轻时巧逢灵药，因而功力\n"
                    "大增。后来习武成性，自认为天下武功第一。\n");
        set("gender", "男性");
        set("age", 65);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 40);
        set("int", 40);
        set("con", 40);
        set("dex", 40);
        set("max_qi", 5500);
        set("max_jing", 5000);
        set("neili", 6000);
        set("max_neili", 6000);
        set("jiali", 200);
        set("combat_exp", 3500000);

        set("inquiry",([
                "风回雪舞" : "这招你让吾儿教你便成，用不着来麻烦老夫。",
                "雪花六出" : "这招你让吾儿教你便成，用不着来麻烦老夫。",
                "剑气封喉" : (: ask_skill1 :),
                "三连环"   : (: ask_skill2 :),
                "神倒鬼跌三连环" : (: ask_skill2 :),
        ]));

        set_skill("force", 300);
        set_skill("xueshan-neigong", 280);
        set_skill("wuwang-shengong", 300);
        set_skill("dodge", 260);
        set_skill("taxue-wuhen", 260);
        set_skill("cuff", 260);
        set_skill("lingxiao-quan", 260);
        set_skill("strike", 260);
        set_skill("piaoxu-zhang", 260);
        set_skill("sword", 280);
        set_skill("hanmei-jian", 280);
        set_skill("yunhe-jian", 280);
        set_skill("xueshan-jian", 280);
        set_skill("shangqing-jian", 280);
        set_skill("parry", 260);
        set_skill("literate", 250);
        set_skill("martial-cognize", 250);

        set("no_teach", ([
                "shangqing-jian" : "老夫这套上清剑法乃是得上清观上代掌门天虚道长所授，并不外传。\n"
                "白自在又道：这剑法虽不及我雪山剑法精妙，但也颇具威力，玄素庄庄主石清与我交好，他"
                "可传你此剑法。",
        ]));

        map_skill("force", "wuwang-shengong");
        map_skill("dodge", "taxue-wuhen");
        map_skill("cuff", "lingxiao-quan");
        map_skill("strike", "piaoxu-zhang");
        map_skill("sword", "xueshan-jian");
        map_skill("parry", "shangqing-jian");

        prepare_skill("strike", "piaoxu-zhang");
        prepare_skill("cuff", "lingxiao-quan");

        create_family("凌霄城", 5, "掌门");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.hui" :),
                (: perform_action, "sword.chu" :),
                (: perform_action, "sword.feng" :),
                (: perform_action, "cuff.san" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        setup();
        
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        if ((int)me->query("shen") < 10000)
        {
                command("heng");
                command("say 我威德先生乃人人称道的正人君子，岂能收你为徒？");
                return;
        }

        if ((int)me->query("combat_exp") < 400000)
        {
                command("heng");
                command("say 你的江湖经验太浅，就算拜到老夫为师，也难有所作为。");
                return;
        }

        if ((int)me->query_skill("xueshan-neigong", 1) < 120)
        {
                command("hmm");
                command("say 你本门内功差成这样，居然也好意思来找老夫！");
                return;
        }

        if ((int)me->query_skill("xueshan-jian", 1) < 120)
        {
                command("say 你冤在我雪山派待了这么久，居然连我雪山剑法都没练好。");
                command("say 真是暴殄天物，气煞老夫也。");
                return;
        }

        command("say 不错，不错。");
        command("say 你运气好，碰巧老夫今日高兴，就收下你吧！");
        command("recruit " + me->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();
        if (me->query("can_perform/xueshan-jian/feng"))
                return "这招我不是已经教过你了吗？自己下去多练吧！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是哪里来的？快给我快快滚开！";

        if (me->query_skill("xueshan-jian", 1) < 1)
                return "你连雪山剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 2000)
                return "哼，你在本派中无所作为，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 250)
                return "你的内功修行太浅，用不了这一招！";

        if (me->query_skill("xueshan-jian", 1) < 160)
                return "你雪山剑法尚未修炼得精深，没法用这招。";

        message_vision( HIY "$n" HIY "哈哈一笑，对$N" HIY "赞道：“不错，"
                        "不错，真不愧是老夫的徒\n弟。今日老夫高兴，传你这"
                       "招，可要看好了！”$n" HIY "话音刚落\n随即一声清啸"
                        "，手中长剑龙吟不止，迸出万道光华疾闪而过。顿\n时"
                       "石屑飞溅，只听“嗤嗤嗤嗤”数声，$N" HIY "对面的青"
                       "石牢壁竟已被\n$n" HIY "手中长剑激荡出的剑芒贯穿，"
                       "留下条一人高，半尺宽的裂\n缝，直看得$N" HIY "目瞪"
                       "口呆。\n" NOR, me, this_object());
        command("haha");
        command("say 刚才我所演示的全是这招的精妙所在，你下去慢慢练吧。");
        tell_object(me, HIC "你学会了「剑气封喉」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("xueshan-jian"))
                me->improve_skill("xueshan-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/xueshan-jian/feng", 1);
        me->add("gongxian", -2000);
        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();
        if (me->query("can_perform/lingxiao-quan/san"))
                return "自己下去练，别老跟我纠缠不休！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是哪里来的？快给我快快滚开！";

        if (me->query_skill("lingxiao-quan", 1) < 1)
                return "你连凌霄拳法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1500)
                return "哼，你在本派中无所作为，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 250)
                return "你的内功修行实在太差，下去练练再来！";

        if (me->query_skill("lingxiao-quan", 1) < 180)
                return "亏你凌霄拳法练成这样，也好意思来找我。";

        message_vision(HIY "$n" HIY "望着$N" HIY "哈哈一笑，道：“好！好！"
                       "好！你过来，我传你此\n招。”$N" HIY "听罢走至他跟"
                       "前，便听$n" HIY "说道：“你瞧着，我这么\n伸手，揪"
                       "住你的后颈，便摔你一个筋……”右手一探，果然已揪\n"
                       "住了$N" HIY "后颈。这一下出手既快，方位又奇，$N"
                       HIY "如何避得，只觉白\n自在手上力道大得出奇，给他一"
                       "抓之下，身子便腾空而起，跌在\n了地上。$n" HIY "一"
                       "笑，左手随即探出，又已抓住$N" HIY "胸口，顺势一\n"
                       "甩，再次将$N" HIY "摔倒。此时却见$n" HIY "左脚随着"
                       "绊去，刹那间把快\n要倒地的$N" HIY "又给绊了一跤。\n"
                       NOR, me, this_object());
        command("haha");
        command("say 师父这一揪、一抓、一绊，接连三招，号称神倒鬼跌三连环。");
        command("say 这三招你下去后慢慢练，日后受益无穷。");
        tell_object(me, HIC "你学会了「神倒鬼跌三连环」。\n" NOR);

        if (me->can_improve_skill("cuff"))
                me->improve_skill("cuff", 1500000);
        if (me->can_improve_skill("lingxiao-quan"))
                me->improve_skill("lingxiao-quan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/lingxiao-quan/san", 1);
        me->add("gongxian", -1500);
        return 1;
}

