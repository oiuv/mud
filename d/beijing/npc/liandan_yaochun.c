#include <ansi.h>

inherit NPC;
inherit F_DEALER;

int do_liandan();
string ask_me();
string ask_yinzhen();

void create()
{
        set_name("姚春", ({"yao chun", "yao", "chun"}));
        set("gender", "男性");
        set("age", 56);
        set("title", HIG "回春堂" NOR);
        set("nickname", HIR "跌打名医" NOR);
        set("long",
                "这便是京城回春堂药铺的跌打名医姚春，身材干\n"
                "瘦，其貌不扬。当年天地会徐天川受了伤，便由\n"
                "他医治，此人既是名医，擒拿短打也是一绝。\n");
        set("attitude", "heroism");
        set("shen_type",1);
        set("str", 32);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("qi", 20000);
        set("max_qi", 20000);
        set("jing", 1600);
        set("max_jing", 1600);
        set("neili", 20000);
        set("max_neili", 20000);

        set("combat_exp", 10000000);
        set("score", 300000);

        set_skill("medical", 200);
        set_skill("zhenjiu-shu", 200);
        set_skill("liandan-shu", 200);
        set_skill("bencao-changshi", 200);
        set_skill("bencao-shuli", 200);
        set_skill("literate", 200);

        map_skill("medical", "bencao-shuli");

        set("inquiry", ([
                "徐天川"  :  "那老猴儿便是我给医治的，怎么你也知道。\n",
                "炼丹"    : (:do_liandan:),
                "liandan" : (:do_liandan:),
                "quest"   :  "在我这里可以帮着我「" HIR "炼丹" NOR + CYN
                             "」，如果愿意可以向我询问。\n",
                "job"     :  "在我这里可以帮着我「" HIR "炼丹" NOR + CYN
                             "」，如果愿意可以向我询问。\n",
                "药材"    :  "去找我的小童，他会帮你处理。\n",
                "原料"    :  "去找我的小童，他会帮你处理。\n",
                "yaocai"  :  "去找我的小童，他会帮你处理。\n",
                "医术"    : (: ask_me :),
                "炼丹术"  : (: ask_me :),
                "针灸术"  : (: ask_me :),
                "本草术理": "掌握本草常识才能领悟高深的本草术理。\n",
                "基本医术": (: ask_me :),
                "银针"    : (: ask_yinzhen :),
                "针灸"    : (: ask_yinzhen :),
        ]));
        setup();
        carry_object("/clone/misc/cloth")->wear();
        carry_object("/clone/book/mbook3");
        carry_object("/clone/book/mbook3");
        carry_object("/clone/book/mbook3");
        carry_object("/clone/book/mbook3");
        carry_object("/clone/book/mbook4");
        carry_object("/clone/book/mbook4");
        carry_object("/clone/book/mbook4");
        carry_object("/clone/book/mbook4");
}


void init()
{
        add_action("do_buy", "buy");
        add_action("do_list", "list");
}

int do_liandan()
{
        int exp, pot;
        object me = this_player();

        if (me->query_temp("liandan"))
        {
                if (me->query_temp("liandan") < 4)
                {
                        command("say 不是要去炼丹吗，怎么还在这呆着？\n");
                        return 1;
                }
                message_vision(CYN "姚春对$N" CYN "微笑道：炼丹是个修身养性的"
                               "过程，你能成功，很不错！\n" NOR, me);
				//奖励增加5倍（2015年4月25日）
                exp = 8 + random(10);
                pot = 4 + random(5);

                me->add("combat_exp", exp);
	        me->improve_potential(pot);

                if (me->query("potential") > me->query_potential_limit())
			pot = 1;

                tell_object(me, HIC "你获得了" + chinese_number(exp) +
                                "点经验和" + chinese_number(pot) + "点潜能。\n"
                                NOR );

                me->delete_temp("liandan");
                me->add("over_quest/liandan_quest", 1);
                return 1;
        } else
	{
                message_vision(CYN "姚春对$N" CYN "点了点头，说道：炼丹是考验"
                               "人的定力修为，心不静则事不成，你去向童子询问「"
                               HIG "药材" NOR + CYN "」吧。\n", me);
                me->set_temp("liandan", 1);
                return 1;
        }
}

string ask_me()
{
        object me;

        me = this_player();

        if (me->query("can_learn_medical/yaochun") == 1)
                return "我不是答应教你了吗，你这人怎么那么啰嗦？";

        if (me->query("shen") < -10000)
                return "你这种魔头，不去杀人都算是武林大幸了。";

        if (me->query("over_quest/liandan_quest") < 100 )
                return "这样吧，你先帮我炼丹百次，心诚之时我自然会传授给你。";

        if (me->query("shen") < 0)
                return "你侠义正事做得不够，多多行善之后我自然会传授给你。";

        me->set("can_learn_medical/yaochun", 1);
               return "既然你欲诚心钻研学医之道，我就成全成全你吧。";
}

int recognize_apprentice(object me, string skill)
{
        if (me->query("shen") < -10000)
        {
                command("say 给我滚开！我不会传授任何技能给你这种魔头！");
                return -1;
        }

        if ( ! me->query("can_learn_medical/yaochun") )
        {
                command("say 我的医术向来是不轻易传授的。");
                return -1;
        }

        if (skill == "literate")
        {
                command("say 读书写字自己去找教书先生学去。");
                return -1;
        }

        if (skill == "liandan-shu")
        {
		        if (me->query("over_quest/liandan_quest") < 2000 )
				{
						command("say 成为炼丹师需要足够的毅力，你先去炼丹满两千次再来学炼丹术。");
						return -1;
				}
				return 1;
        }

        if (skill != "medical" &&
            skill != "zhenjiu-shu")
        {
                command("say 我只能传授基本医术和针灸术。");
                return -1;
        }

        return 1;
}

string ask_yinzhen()
{
//      mapping fam;
        object ob;
        object me = this_player();

        if (me->query("shen") < 0)
                return "你走吧，我的神针可不会给你这样的人。";

        if ((int)me->query_skill("zhenjiu-shu", 1) < 60)
                return "你针灸术还不娴熟，随便用针会弄出人命来的。";

        if (present("yin zhen", this_player()))
                return "你身上不是还有一根吗？";

        ob = new("/d/beijing/obj/yinzhen");
        ob->move(me);

        message_vision(HIW "\n姚春从针盒里轻轻拈出一根银针，递给了$N" HIW "。\n" NOR, me);
                return "这针可是用来救命的，好好的利用它为人治病吧。";
}
