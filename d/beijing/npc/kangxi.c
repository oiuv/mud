//康熙大帝

#include <ansi.h>
#define INVASIOND "/adm/daemons/invasion/invasiond"

inherit NPC;
mixed ask_reward();

void create()
{
	set_name(HIY"康熙大帝"NOR, ({ "kangxi dadi", "kangxi", "dadi", "huang shang"}));
       set("title", HIC"真龙天子"NOR );
	set("age", 32);
	set("gender", "男性");
	set("long", "这就是当今圣上康熙大帝玄烨，一副九仪天尊之相。\n");
	set("attitude", "peaceful");

	set("str", 30);
	set("dex", 30);
	set("combat_exp", 100000);
	set("shen_type", 1);

	set_skill("unarmed", 100);
	set_skill("dodge", 100);
	set_skill("parry", 100);
	set_skill("sword", 100);
	set_skill("force", 100);
	set_temp("apply/attack", 100);
	set_temp("apply/defense", 100);
	set_temp("apply/damage", 60);
	set_temp("apply/armor", 60);

    set("inquiry", ([
           	"赏赐" : (: ask_reward :),
           	"请赏" : (: ask_reward :),
           	"领赏" : (: ask_reward :),
            "reward" : (: ask_reward :),
        ]));
	setup();
    carry_object("/d/beijing/npc/obj/longpao")->wear();
}

void init()
{
    object me = this_player();

    if ( userp(me) )
    {
      command("say 尔等来此何为？");
      add_action("do_answer","answer");
    }
}            


mixed ask_reward()

{
        object me;
        string *w, word, space;
        space = "     ";

        me = this_player();

        w = ({ "国富", "民强", "君子", "杀敌", "保家", "为国",
               "忠君", "爱民", "扶弱", "济贫", "开拓", "进取", "求实", "奋进",
               "仁义", "礼智", "善德", "立志", "忠孝", "敬老", "爱幼", "助人",
               "龙腾","虎跃","自强","栋梁","上进","不屈","不挠","安分","守己",
               "相助","互助","安家","立业","尊师","重道","创造","辉煌","正大",
               "光明","磊落","勇往","直前","尽善","尽美","果断","精诚","团结",
               "从容","精妙","汗马","功劳","发愤","图强","精益","求精","胆大",
               "心细","救死","扶伤","才华","翻天","覆地","百战","百胜","妙手",
               "回春","弘扬","正气","灿烂","辉煌","沧海","桑田","聚精","会神",
               "腾达","慷慨","名正","言顺","鼓舞","奋发","图强","丰功","伟绩",
               "必胜","信心","奉公","守法","道义","宏图","扶老","携幼","秉公",
               "惩腐","倡廉","惩恶","扬善","博大","精深","博学","诚实","守信",
               "诚意","德才","耐劳","坚强","坚韧","廉洁","奉公","守法","齐心",
               "协力","传统","美德","文明","礼貌","谦虚","奉献","爱岗","敬业",
               "爱心","和睦","安定","强国","勤奋","好学","求知","刻苦","聪明",
               "伶俐","敏锐","坚韧","挺拔","坚强","保家","为国","善良","除暴",
               "安良","孝顺","大度","大义","诚恳","诚实","真诚","信义","重情",
               "慈悲","追求","理想","无私","为国","为民","创新","敬仰","铁骨",
               "英明","谦恭","拼搏","鞠躬","尽瘁","呕心","沥血","安居","乐业",
               "真理","信念","振奋","振兴","忠诚","坦荡","洁身","自爱","勤俭",
               "宽容","忍让","谅解","谦卑","豪杰","无畏","攀登","探索","实践",
               "求实","活跃","毅力","坚毅","谨慎","图强","公正","严明","诚信",
               "求精","国富","民强","君子","杀敌","保家","为国","忠君","爱民",
               "扶弱","济贫","开拓","进取","求实","奋进","仁义","礼智","善德", 
               "立志","忠孝","敬老","爱幼","助人", });
        word = w[random(sizeof(w))];

       if ( environment(this_object()) != find_object("/d/beijing/hg") )
          {
            command("say 怪哉，朕如何不在皇宫！");
            message_vision("$N急急忙忙地离开了。\n", this_object());
            this_object()->move("/d/beijing/hg");
            return 1;
          }
        if ( ! find_object(INVASIOND) || ! INVASIOND->query("record") )
           return command("say 如今并无八国联军入侵呀！");
        if ( ! INVASIOND->query("record/all_killed") )
           return command("say 朕并未恩准赏赐，尔等速速离去！");
        if ( me->query("waidi/born_time") != INVASIOND->query("record/born_time"))
           return command("say 尔之赏赐已过期了！"); 


        command("say 原来是抗击八国联军的义士，不错不错！");
        command("say 朕一生最赏识的便是文武双全的能人志士，这位" +
                RANK_D->query_respect(me) + "杀敌勇猛，足见武艺出众，\n"
                "              但朕尚要出道殿试之题，看看你的文采若何。");
        command("say 你看看朕写的这两个是什么字？(可用answer xxx 作答)");
        me->set("waidi/word",word);
        if ( random(2) == 1 )
        word = word[0..1] + space[0..0] + word[2..3]; 
        write(TEXT2PIC_D->Display(word) + "\n");
        return 1;
}             

mixed do_answer(string arg)
{
    int pot,gn;
    string reward, unit;
    object me, ob, gold;

    string *ob_list = ({
                "/clone/fam/pill/linghui1",
                "/clone/fam/pill/linghui1",
                "/clone/fam/pill/linghui1",
                "/clone/fam/pill/linghui1",              
                "/clone/fam/pill/full1",
                "/clone/fam/pill/full1",
                "/clone/fam/pill/full1",
                "/clone/fam/pill/full1",
                "/clone/fam/pill/neili2",
                "/clone/fam/pill/neili2",
                "/clone/fam/pill/neili2",
                "/clone/fam/pill/neili2",
                "/clone/fam/etc/va1",
                "/clone/fam/etc/va2",
                "/clone/fam/etc/va3",
                "/clone/fam/etc/va4",
                "/clone/fam/etc/va5",
                "/clone/fam/etc/va6",
        }); 

    me = this_player();

    if (! me->query("waidi/word") )
    return command("say 又没人给你出过题，你答什么答！");
    if ( ! find_object(INVASIOND) || ! INVASIOND->query("record") )
           return command("say 如今并无八国联军入侵呀！");
    if ( ! INVASIOND->query("record/all_killed") )
           return command("say 朕并未恩准赏赐，尔等速速离去！");
    if ( me->query("waidi/born_time") != INVASIOND->query("record/born_time"))
    return command("say 尔之赏赐已过期了！");

    if ( !arg )
    return command("say 你要回答什么?");

    if ( me->query("waidi/word") != arg )
    {
       command("say 可惜，这位" + RANK_D->query_respect(me) + "虽然武艺出众,"
               "但是目不识丁，朕不能给你赏赐了。");
       command("say 你还是速速离去吧！");
       me->delete("waidi");
       return 1;
    }

    if ( me->query("waidi/word") == arg )
    {
      pot = 100 * me->query("waidi/number") + random(300);
      gn = me->query("waidi/number") + random(2);
      if (gn > 10) gn = 10;

      reward = ob_list[random(sizeof(ob_list))];
      ob = new(reward);
      if (ob->query("base_unit"))
                unit = ob->query("base_unit");
        else
                unit = ob->query("unit");
       gold = new("/clone/money/gold");
       gold->set_amount(gn);

     me->add("potential",pot);
     gold->move(me,1);
     ob->move(me,1);

     command("say 不错，不错，这位" + RANK_D->query_respect(me) + "不但武艺出众,"
              "文采亦是不菲，朕要大大的赏赐于你。");
   message( "invasion", HIR"【外敌入侵】"NOR HIG"大内总管[Danei zongguan]:圣旨到！\n"NOR
   HIY"            传皇上口谕：\n"
   "            赐抗敌义士" + me->query("name") + "(" + me->query("id") + ")" +
   "潜能" + chinese_number(pot) + "点，黄金" + chinese_number(gn) + "两，" +
   ob->query("name") + NOR HIY"一" + unit + "。\n"
            "                                         钦此！\n" NOR,users());

     me->delete("waidi");
     return 1;
    }

}

void unconcious()
{
        die();
}
