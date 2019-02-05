#include <ansi.h>

#define MOJIAN    "/clone/lonely/mojian"

inherit NPC;

mixed ask_jian();
mixed ask_skill1();
mixed ask_skill2();

void create()
{
        object ob;
        set_name("石清", ({ "shi qing", "shi", "qing"}));
        set("gender", "男性");
        set("title", "江南玄素庄庄主");
        set("nickname", HIW "玄素双剑" NOR);
        set("age", 37);
        set("long", @LONG
这便是江南玄素庄庄主石清，他在江湖中名声
极好，为人很是狭义。只见他丰神俊朗，衣衫
飘飘，腰间挂着一柄长剑。
LONG );
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 32);
        set("int", 31);
        set("con", 33);
        set("dex", 31);

        set("max_qi", 4500);
        set("max_jing", 3000);
        set("neili", 5000);
        set("max_neili", 5000);
        set("jiali", 180);
        set("combat_exp", 2200000);
        set("score", 25000);

        set_skill("force", 220);
        set_skill("wuwang-shengong", 220);
        set_skill("sword", 220);
        set_skill("shangqing-jian", 220);
        set_skill("dodge", 220);
        set_skill("feiyan-zoubi", 220);
        set_skill("strike", 220);
        set_skill("piaoxu-zhang", 220);
        set_skill("parry", 220);
        set_skill("literate", 250);
        set_skill("martial-cognize", 180);

        map_skill("force", "wuwang-shengong");
        map_skill("sword", "shangqing-jian");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("parry", "shangqing-jian");
        map_skill("strike", "piaoxu-zhang");

        prepare_skill("strike", "piaoxu-zhang");

        set("inquiry", ([
                "墨剑"   : (: ask_jian :),
                "浊流剑" : (: ask_skill1 :),
                "清流剑" : (: ask_skill2 :),
                "闵柔"   : "她是在下的内子，你问他做甚？",
                "封万里" : "我亏欠他实在太多，实在太多。",
                "白自在" : "凌宵城主“威德先生”白自在号称天下武功第一，剑法举世无双。",
                "白万剑" : "他是凌宵城主威德先生之子，号称“气寒西北”，剑法很是了得。",
                "石破天" : "他是在下的犬子，教子不严，我恨不得亲手杀了他。",
                "玄铁令" : "哎……如果有此令，便能请到谢烟客帮忙做三件事。",
                "谢烟客" : "谢烟客便是“摩天居士”，当年就他散布玄铁令三枚。",
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "sword.zhuo" :),
                (: perform_action, "sword.qing" :),
                (: exert_function, "recover" :),
        }) );

        setup();

        if (clonep())
        {
                ob = find_object(MOJIAN);
                if (! ob) ob = load_object(MOJIAN);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        ob->wield();
                } else
                {
                        ob = new("/clone/weapon/changjian");
                        ob->move(this_object());
                        ob->wield();
                }
        }

        carry_object("/d/city/npc/cloth/cloth")->wear();
        add_money("silver", 50);
}

int recognize_apprentice(object ob, string skill)
{
        if (interactive(ob) && (! ob->query("family") ||
           ob->query("family")["master_name"] != "白自在"))
        {
                command("hmm");
                command("say 石某与阁下素无渊源，何谈传授二字？\n");
                return -1;

        }

        if ((int)ob->query("shen") < 10000)
        {
                command("heng");
                command("say 我石某岂能将恩师的剑法传于你这种江湖宵小？");
                return -1;
        }

        if (skill != "shangqing-jian" && skill != "sword")
        {
                command("shake");
                command("say 我只传授上清剑法与一些基本的剑法知识，其它去找你"
                        "师父学吧。");
                return -1;
        }

        if (skill == "sword" && ob->query_skill("sword", 1) > 179)
        {
                command("hmm");
                command("say 你的剑法造诣已经非同凡响了，剩下就自己去练吧。");
                return -1;
        }

        if (! ob->query_temp("can_learn/shiqing"))
        {
                command("sigh");
                command("say 哎……我亏欠你雪山派实在太多，传授你这套剑法也是"
                        "应该的。");
                ob->set_temp("can_learn/shiqing", 1);
        }
        return 1;
}

mixed ask_skill1()
{
        object me;

        me = this_player();
        if (me->query("can_perform/shangqing-jian/zhuo"))
                return "这招阁下不是已经练成了吗？";

        if (me->query("family/family_name") != "凌霄城")
                return "石某与阁下素无渊源，不知阁下这话从何而来？";

        if (me->query_skill("shangqing-jian", 1) < 1)
                return "你连上清剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 800)
                return "嗯，你在雪山派中的地位还不足以让我传你这一招。";

        if (me->query("shen") < 15000)
                return "学武之人，自应以德义为先。你侠义正事做得不够，这招我不能传你。";

        if (me->query_skill("force") < 200)
                return "你的内功修行太浅，用不了这一招！";

        if (me->query_skill("shangqing-jian", 1) < 140)
                return "你上清剑法尚未修炼得精深，没法用这招。";

        message_vision(HIY "$n" HIY "微微一笑，从怀中轻轻取出了一本"
                       "剑谱，指着其中一段对$N" HIY "细\n说良久，$N"
                       HIY "一边听一边点头。\n" NOR, me, this_object());

        command("nod");
        command("say 刚才我所说的全是这招的精妙所在，你下去慢慢练吧。");
        tell_object(me, HIC "你学会了「浊流剑」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("shangqing-jian"))
                me->improve_skill("shangqing-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/shangqing-jian/zhuo", 1);
        me->add("gongxian", -800);
        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();
        if (me->query("can_perform/shangqing-jian/qing"))
                return "这招阁下不是已经练成了吗？";

        if (me->query("family/family_name") != "凌霄城")
                return "石某与阁下素无渊源，不知阁下这话从何而来？";

        if (me->query_skill("shangqing-jian", 1) < 1)
                return "你连上清剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1600)
                return "嗯，你在雪山派中的地位还不足以让我传你这一招。";

        if (me->query("shen") < 30000)
                return "学武之人，自应以德义为先。你侠义正事做得不够，这招我不能传你。";

        if (! me->query("can_perform/shangqing-jian/zhuo"))
                return "欲练清流剑必先通晓浊流剑诀，你先学那招吧。";

        if (me->query_skill("force") < 220)
                return "你的内功修行太浅，用不了这一招！";

        if (me->query_skill("shangqing-jian", 1) < 160)
                return "你上清剑法尚未修炼得精深，没法用这招。";

        message_vision( HIY "$n" HIY "哈哈一笑，对$N" HIY "笑道：“没想"
                        "到你身在雪山派，却将我上清观\n的剑法练得如此出"
                        "神入化，石某今日便传你这招好了。”只听$n" HIY
                        "\n说完，便开始慢慢的演示剑招，如此反复了数遍。"
                        "$N" HIY "在一旁仔细观\n看，随后会心一笑，似乎"
                        "明白了什么。\n" NOR, me, this_object());
        command("nod");
        command("say 刚才我演示的你就记清了吗？记清了就自己下去练吧。");
        tell_object(me, HIC "你学会了「清流剑」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("shangqing-jian"))
                me->improve_skill("shangqing-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/shangqing-jian/qing", 1);
        me->add("gongxian", -1600);
        return 1;
}

mixed ask_jian()
{
        object me;
        object ob;
        object owner;

        me = this_player();
        if (me->is_bad())
        {
                if (me->query("family/family_name") == "凌霄城")
                        message_vision(CYN "$N" CYN "冷哼一声，对$n" CYN "道："
                                       "“你若再敢在我面前说三道四，小心我替雪"
                                       "山派清除你这个败类！”\n" NOR,
                                       this_object(), me);
                else
                        message_vision(CYN "$N" CYN "冷笑一声，对$n" CYN "说道"
                                       "：“阁下什么来头？居然敢打听石某的配剑"
                                       "？”\n" NOR,
                                       this_object(), me);
                return 1;
        }

        if (me->query("family/family_name") != "凌霄城")
                return "石某与阁下素不相识，不知阁下无故打听在下的配剑究是为何？";

        if (me->query("family/master_id") != "bai zizai")
                return "哼，就凭你也配要石某的配剑？要拿找你师父来吧！";

        if (me->query("shen") < 30000)
                return "学武之人，自应以德义为先。我的配剑不会随便给人，你走吧。";

        if (me->query_skill("shangqing-jian", 1) < 150)
                return "墨剑只有配合我上清观的剑法才能显示其威力，你剑法练好后再来吧。";

        ob = find_object(MOJIAN);
        if (! ob) ob = load_object(MOJIAN);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "嗯？石某的墨剑不就在你身上吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "你来晚了一步，我的配剑已经让别人取去了。";

                if (owner->query("family/family_name") == "凌霄城")
                        return "我的配剑被你雪山派的" + owner->query("name") +
                               "取去了，你要用就去找他吧。";
                else
                        return "我的配剑被" + owner->query("name") +
                               "取去了，你去找他吧！";
        }
        ob->move(this_object());

        ob = new("/clone/weapon/changjian");
        ob->move(this_object());
        ob->wield();

        message_vision(CYN "$N" CYN "叹道：“我的配剑你拿去用吧，但"
                       "切记行走江湖，一切一侠义为重！”\n" NOR,
                       this_object(), me);
        command("give mo jian to " + me->query("id"));
        return 1;
}
