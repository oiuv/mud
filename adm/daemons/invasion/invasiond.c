//  【笑谈天下】啊啦[Opop]：英、俄、德、日、意、法、美、奥

inherit F_DBASE;

#include <ansi.h>
#define   INVADE_NPC  "/adm/daemons/invasion/npc"
#define TOTAL_INVADER 24
#define TURN 3600

void create()
{
        seteuid(getuid());
        set("name", HIG "外敌入侵任务主文件" NOR);
        set("id", "invasion");
        call_out("main", 600);
}


void main()
{
   int i,lvl;

   message( "invasion", HIR"【外敌入侵】" BLINK
            "警报！警报！八国联军攻入北京了！\n" NOR
            HIR"【外敌入侵】"NOR HIY"请各位大虾速至北京抵御外敌！"+
            "打开waidi频道可获知战况。\n"NOR, users() );
   this_object()->delete("record");
   this_object()->set("record/born_time",time());

   for (i = 0; i < TOTAL_INVADER; i++)
   {
        if ( i == 0 ) lvl = 5;
        if ( i >= 1 && i <= 2 ) lvl = 4;
        if ( i >= 3 && i <= 5 ) lvl = 3;
        if ( i >= 6 && i <=11 ) lvl = 2;
        if ( i >= 12 && i <= 23 ) lvl = 1;

        call_other(__FILE__, "create_invader", lvl, i);
   }

      remove_call_out("main");
      call_out("main", TURN);

}

// generate an invader with nation & skill level
object create_invader(int lvl, int number)
{
        object ob;

        string *n, *place, nation, locate;

        n = ({ "日本", "日本", "英国", "俄罗斯", "德国", "法国", "美国",
               "奥匈帝国", "意大利"});  
  
        place = ({"/d/beijing/tiananmen", "/d/beijing/dianmen",
                  "/d/beijing/huangling", "/d/beijing/wenmiao",
                  "/d/beijing/xingchang", "/d/beijing/minju_y",
                  "/d/beijing/mianguan", "/d/beijing/yong_3",
                  "/d/beijing/tiantan", "/d/beijing/caishi"});

        nation = n[random(sizeof(n))];
        locate = place[random(sizeof(place))];

        switch (nation)
        {
        case "日本":
                ob = new(INVADE_NPC + "/japanese");
                NPC_D->generate_jp_name(ob);
                break;
        case "英国":
        case "美国":
                ob = new(INVADE_NPC + "/english");
                NPC_D->generate_e_name(ob);
                break;
        case "法国":
        case "德国":
        case "俄罗斯":
        case "意大利":
        case "奥匈帝国":
                ob = new(INVADE_NPC + "/european");
                NPC_D->generate_e_name(ob);
                break;
        }

        ob->set("nation", nation);
        ob->set("number", number);
        ob->set("born_time",this_object()->query("record/born_time"));

        call_other(__FILE__, "set_invader_skill",ob, lvl);
        ob->move(locate);
        if ( objectp(locate) )
        tell_room(locate,ob->query("name") + "杀了过来。\n");
}


// set the the level of the invader's skill

void set_invader_skill(object ob, int lvl)
{
        int sk_lvl;
        string *ks;
        int i;
        int exp, qi, jing, neili;
        string rank;

        sk_lvl = lvl * 50 + 200 + random(50);
        switch(lvl)
        {
         case 1 :
                      sk_lvl = 180 + random(10);
                      qi = 10000;
                      rank = HIW"雇佣兵"NOR;
                      break;
         case 2 :
                      sk_lvl = 300 + random(50);
                      qi = 15000;
                      rank = HIB"小头目"NOR;
                      break;
         case 3 :
                      sk_lvl = 400 + random(50);
                      rank = HIC"大头目"NOR;
                      qi = 18000;                 
                      break;
         case 4 :
                      sk_lvl = 450 + random(50);
                      qi = 20000;
                      rank = YEL"副司令"NOR;                
                      break;
         case 5 :
                      sk_lvl = 500 + random(50);
                      rank = HIR"总司令"NOR;
                      qi = 30000;             
                      break;
        }

        ob->set("title", HIY + "八国联军"NOR + rank + NOR);
        ob->set("nickname",HIW + ob->query("nation") + "雇佣军"NOR);
        ob->set("lvl",lvl);
        ob->set("rank",rank);
        ob->set("kind","invader");

        exp = sk_lvl * sk_lvl * sk_lvl / 10 + random( 1000 * lvl );
        ob->set("combat_exp", exp);
        //设置skill
        if (! ob->query_skills())
                return;

        ks = keys(ob->query_skills());

        for (i = 0; i < sizeof(ks); i++)
                ob->set_skill(ks[i], sk_lvl);

        jing = qi / 2;
        neili = qi * 8 / 5;

        ob->set("max_qi", qi);
        ob->set("max_jing", jing);
        ob->set("max_neili", neili);
	    ob->set("eff_jing", jing);
	    ob->set("jing", jing);
        ob->set("eff_qi", qi);
	    ob->set("qi", qi);
        ob->set("neili", neili * 2);
        ob->set("jiali", ob->query_skill("force") / 2);

        this_object()->set("record/" + ob->query("number") + "/name",
                            ob->query("name"));
        this_object()->set("record/" + ob->query("number") + "/title",
                            ob->query("title"));
        this_object()->set("record/" + ob->query("number") + "/exist", 1);  
        return;
}

void set_reward()
{
   this_object()->set("record/all_killed",1);
   message( "invasion", HIR"【外敌入侵】"NOR HIG"大内总管[Danei zongguan]:圣旨到！\n"NOR
         HIY"                   奉天承运，皇帝诏曰：\n"
            "           本次入侵之外敌被我方义士全歼，皇上龙颜大乐，\n"
            "           今特命所有抗击外敌有功者进宫领赏。\n"
            "                                钦此！\n" NOR,users());
}
