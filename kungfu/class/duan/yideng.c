#include <ansi.h>
#include "duan.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();
mixed ask_skill2();

void create()
{
    	set_name("一灯大师", ({ "yideng dashi", "yideng", "dashi" }));
    	set("long", @LONG
一灯大师乃江湖中人称“东邪西毒，南帝北丐”中
的南帝段皇爷，当年凭着段氏“一阳指”而独步武
林，罕逢敌手。但却在中年时因一段悲情而出家为
僧，之后大彻大悟，成为一位得道高僧。
LONG );
    	set("title", "大理国退位皇帝");
    	set("nickname", HIY "南帝" NOR);
    	set("gender", "男性");
    	set("age", 71);
	set("shen_type", 1);
    	set("attitude", "friendly");

    	set("str", 33);
    	set("int", 35);
    	set("con", 38);
    	set("dex", 33);

    	set("qi", 6500);
    	set("max_qi", 6500);
    	set("jing", 5000);
    	set("max_jing", 5000);
    	set("neili", 8000);
    	set("max_neili", 8000);
    	set("jiali", 200);
    	set("combat_exp", 4000000);
    	set("score", 500000);

        set_skill("force", 340);
        set_skill("xiantian-gong", 240);
        set_skill("duanshi-xinfa", 320);
        set_skill("kurong-changong", 320);
        set_skill("dodge", 320);
        set_skill("tiannan-bu", 320);
        set_skill("cuff", 300);
        set_skill("jinyu-quan", 300);
        set_skill("strike", 300);
        set_skill("wuluo-zhang", 300);
        set_skill("sword", 300);
        set_skill("staff", 300);
        set_skill("duanjia-jian", 300);
        set_skill("finger", 340);
        set_skill("qiantian-zhi", 340);
        set_skill("yiyang-zhi", 340);
        set_skill("parry", 300);
        set_skill("jingluo-xue", 300);
        set_skill("buddhism", 340);
        set_skill("literate", 300);
        set_skill("sanscrit", 300);
        set_skill("martial-cognize", 320);

        map_skill("force", "xiantian-gong");
        map_skill("dodge", "tiannan-bu");
        map_skill("finger", "yiyang-zhi");
        map_skill("cuff", "jinyu-quan");
        map_skill("strike", "wuluo-zhang");
        map_skill("parry", "yiyang-zhi");
        map_skill("sword", "duanjia-jian");
        map_skill("staff", "yiyang-zhi");

        prepare_skill("finger", "yiyang-zhi");

        create_family("段氏皇族", 11, "传人");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "finger.jian" :),
                (: perform_action, "finger.qian" :),
                (: perform_action, "finger.dian" :),
                (: perform_action, "finger.die" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

    	set("inquiry",([
          	"王重阳"   : "中神通王重阳名动江湖，老衲很是佩服。",
          	"瑛姑"     : "那是老衲出家前的一段孽缘，不提也罢。",
          	"老顽童"   : "呵呵，那人武功高强，可是心机却如顽童一般。",
          	"周伯通"   : "呵呵，那人武功高强，可是心机却如顽童一般。",
          	"郭靖"     : "哦，那个憨小子心地善良，忠厚老实，没黄蓉一定要吃亏。",
         	"黄蓉"     : "是郭靖那憨小子的伴侣吧，人倒很是机灵。",
          	"知识"     : "我可以传授你禅宗心法和梵文，其它的找你的师父学习吧。",
          	"传授"     : "我可以传授你禅宗心法和梵文，其它的找你的师父学习吧。",
          	"阳关三叠" : (: ask_skill1 :),
            "先天功乾阳剑气" : (: ask_skill2 :),//新增 by 薪有所属
    	]));

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

    	setup();
    	carry_object("/clone/cloth/seng-cloth")->wear();
}

void init()
{
        object ob;
        ::init();

        if (interactive(ob = this_player()) && ! is_fighting())
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
        if (! ob || environment(ob) != environment()) return;

        if ((int)ob->query("shen") < -50000)
                command("say 这位施主眼中戾气深重，劝施主好自为知。");

        else
        if ((int)ob->query("shen") < -5000)
                command("say 这位施主，切记魔从心起，其道必诛。");

        else
        if ((int)ob->query("shen") < 0)
                command("say 这位施主，人行江湖，言行当正，切务走进邪魔歪道。");

        else
        if ((int)ob->query("shen") > 50000)
                command("say 施主行事光明磊落，日后必为武林翘楚。");

        else
                command("say 这位施主，光明正道任人走，望施主多加保重。");

        return;
}

int recognize_apprentice(object me, string skill)
{
        if (me->query("shen") < 0)
        {
                command("say 施主眼中戾气深重，多行善事之后老衲自会传授给你。");
                return -1;
        }

        if (skill != "sanscrit" && skill != "buddhism")
        {
                command("say 这些还是向你的师父学吧，老衲只能传授些知识给你。");
                return -1;
        }

        if (skill == "buddhism" && me->query_skill("buddhism", 1) > 199)
        {
                command("haha");
                command("say 你的佛法造诣已经非同凡响了，剩下的自己去研究吧。");
                return -1;
        }

        if (! me->query_temp("can_learn/yideng"))
        {
                command("say 南无阿弭佗佛。");
                command("say 既然施主有心面佛，老衲自当竭力传授。");
                me->set_temp("can_learn/yideng", 1);
        }

        return 1;
}

mixed ask_skill1()
{
        object me;

        me = this_player();
        if (me->query("can_perform/yiyang-zhi/die"))
                return "你一阳指练到这种境界，老衲已没什么可教的了。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "施主与老衲素不相识，不知施主此话从何说起？";

        if (me->query_skill("yiyang-zhi", 1) < 1)
                return "你连一阳指诀都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 2500)
                return "你为段氏所作出的贡献还不够，这招老衲暂时还不能传你。";

        if (me->query("shen") < 50000)
                return "你的侠义正事还做得不够，这招老衲暂时还不能传你。";

        if (me->query_skill("force") < 300)
                return "你内功的修为还不够，练高了再来吧。";

        if (me->query("max_neili") < 5000)
                return "你的内力修为还不够，练高点再来吧。";

        if (me->query_skill("jingluo-xue", 1) < 200)
                return "你对经络学的了解还不透彻，研究透了再来找我吧。";

        if (me->query_skill("yiyang-zhi", 1) < 200)
                return "你的一阳指诀功力还不够，练高了再说吧。";

        message_sort(HIY "\n$n" HIY "凝视了$N" HIY "好一会儿，随即点了点"
                     "头，将$N" HIY "招至身边，在耳旁低声细说良久，$N" HIY
                     "听后会心的一笑，看来对$n" HIY "的教导大有所悟。\n\n"
                     NOR, me, this_object()); 

        command("buddhi");
        command("say 老衲已将此绝技传授给你，切记莫走进邪魔歪道！");
        tell_object(me, HIC "你学会了「阳关三叠」。\n" NOR);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("jingluo-xue"))
                me->improve_skill("jingluo-xue", 1500000);
        if (me->can_improve_skill("jingluo-xue"))
                me->improve_skill("jingluo-xue", 1500000);
        if (me->can_improve_skill("jingluo-xue"))
                me->improve_skill("jingluo-xue", 1500000);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("yiyang-zhi"))
                me->improve_skill("yiyang-zhi", 1500000);
        if (me->can_improve_skill("yiyang-zhi"))
                me->improve_skill("yiyang-zhi", 1500000);
        if (me->can_improve_skill("yiyang-zhi"))
                me->improve_skill("yiyang-zhi", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/yiyang-zhi/die", 1);
        me->add("gongxian", -2500);

        return 1;
}

//新增先天功乾阳剑气 by 薪有所属
mixed ask_skill2()
{
        object me;

        me = this_player();
        if(me->query("can_perform/xiantian-gong/jian"))
                return "你先天功的乾阳剑气练到这种境界，老衲已没什么可教的了。";

        //if( query("family/family_name", me) != query("family/family_name") )
        if (me->query("family/family_name")!= "全真教" && me->query("family/family_name")!= "段氏皇族")
                return "施主与老衲素不相识，不知施主此话从何说起？";

        if (me->query_skill("yiyang-zhi", 1) < 1)
                return "你连一阳指诀都没学，还谈什么绝招可言？";

        if (me->query_skill("xiantian-gong", 1) < 1)
                return "这招暂时不能传授于你，等你学会先天功再来找我吧。";

        if (me->query("shen") < 50000)
                return "你的侠义正事还做得不够，这招老衲暂时还不能传你。";

        if (me->query_skill("force") < 500)
                return "你内功的修为还不够，练高了再来吧。";

        if (me->query("max_neili") < 5000 )
                return "你的内力修为还不够，练高点再来吧。";
                
        if (me->query("gongxian") < 3000)
        	      return "你的贡献值不够，这招先不忙传你。";

        if (me->query_skill("xiantian-gong", 1) < 280)
                return "你的先天功功力还不够，练高了再说吧。";
                
        if (me->query_skill("yiyang-zhi", 1) < 280)
                return "你的一阳指诀修为还不够，练高了再说吧。";
                
        if (me->query_skill("jingluo-xue", 1) < 200)
                return "你对经络学的了解还不透彻，研究透了再来找我吧。";

        message_sort(HIY "\n$n" HIY "凝视了$N" HIY "好一会儿，随即点了点"
                     "头，将$N" HIY "招至身边，在耳旁低声细说良久，$N" HIY
                     "听后会心的一笑，看来对$n" HIY "的教导大有所悟。\n\n"
                     NOR, me, this_object());

        command("buddhi");
        command("say 这本是中神通的绝技，现老衲已将此绝技传授给你，切记莫走进邪魔歪道！");
        tell_object(me, HIC "你学会了「先天功乾阳剑气」。\n" NOR);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("xiantian-gong"))
                me->improve_skill("xiantian-gong", 1500000);
        if (me->can_improve_skill("xiantian-gong"))
                me->improve_skill("xiantian-gong", 1500000);
        if (me->can_improve_skill("yiyang-zhi"))
                me->improve_skill("yiyang-zhi", 1500000);
        if (me->can_improve_skill("yiyang-zhi"))
                me->improve_skill("yiyang-zhi", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/xiantian-gong/jian", 1);
        me->add("gongxian", -3000);

        return 1;
}