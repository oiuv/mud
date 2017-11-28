// Copyright (C) 2003, by Lonely. All rights reserved.
// This software can not be used, copied, or modified 
// in any form without the written permission from authors.

inherit NPC;

#include <ansi.h>
#include <login.h>

#define PET_OBJ        "/clone/npc/pet.c"
#define PET_DIR        "/data/pet/"

int  do_selete();  
void get_type(string arg, object ob);
void get_subtype(string arg, object ob);
void get_gender(string arg,object ob);
void get_id(string arg, object ob);
void get_name(string arg, object ob);
void get_desc(string arg, object ob);
void build_pet(object ob);
int  check_legal_name(string name, int max_len);
int  check_legal_id(string name);
void confirm_dispose(string arg, object ob, object fabao_ob);

string* pet_type_name = ({
        "马", "驴", "骡", "驼", "牛", "象",
        "狮", "虎", "豹", "鹿", "鹤", "雕",
        "羊", "猴", "熊", "狼", "狐", "貂",
        "驹", "兽",
});

string* pet_id_surfix = ({
        "ma", "lv", "luo", "tuo", "niu", "xiang",
        "shi", "hu", "bao", "lu", "he", "diao",
        "yang", "hou", "xiong", "lang", "hu", "diao",
        "ju", "shou",
});

string* pet_unit_name=({
        "匹", "头", "头", "头", "头", "头",
        "只", "只", "只", "头", "只", "只",
        "头", "只", "只", "条", "只", "只",
        "匹", "头",
});

void create()
{
        set_name("马老板", ({"horse boss", "boss"}));
        set("title", HIR"坐骑商人"NOR);
        set("gender", "男性");
        set("age", 32);
        set("long", "一个身着朴素的老板，是关东大风堂派驻在扬州城提供坐骑的。\n"
                    "在这里你可以选择(choose)自己称心如意的坐骑。\n");
                    
        set("attitude", "peaceful");
        set_skill("training", 400);
        setup();
        carry_object("/clone/cloth/cloth")->wear();
        add_money("coin", 10000);

}

void init()
{
//      object ob;

        ::init();
        add_action("do_selete", "choose");
}

int do_selete()
{
        object me = this_player();
                   
        if (me->query_skill("training", 1) < 100)
                return notify_fail("你的驭兽术太低了，即使养了坐骑，也会离你而去。\n");
        
        if (! me->query_temp("pet/money"))
        {
                command("say 这位" + RANK_D->query_respect(me) + "，每只坐骑一千两黄金！");
                return 1;
        }
                               
        write("您要养哪类坐骑：\n");
        write(" 1. 马   2. 驴   3. 骡   4. 驼  5. 牛  6. 象\n");
        write(" 7. 狮   8. 虎   9. 豹  10. 鹿 11. 鹤 12. 雕\n");
        write("13. 羊  14. 猴  15. 熊  16. 狼 17. 狐 18. 貂\n");
        write("19. 驹  20. 兽\n");
        write("请选择：(q 键取消)");
        
        input_to( (: get_subtype :), me);
        return 1;
}
void get_subtype(string arg, object ob)
{
        int order;
   
        if (arg == "q" || arg == "Q")    
                return;

        sscanf(arg, "%d", order);
    
        if (order <= 0 || order > 20)  
        {               
                write("到大风堂做买卖就得守规矩，选了坐骑就不能后悔了，除非养了也不用它：\n");
                write("您要养哪类坐骑：\n");
                write(" 1. 马   2. 驴   3. 骡   4. 驼  5. 牛  6. 象\n");
                write(" 7. 狮   8. 虎   9. 豹  10. 鹿 11. 鹤 12. 雕\n");
                write("13. 羊  14. 猴  15. 熊  16. 狼 17. 狐 18. 貂\n");
                write("19. 驹  20. 兽\n");
                write("请选择：(q 键取消)");
                input_to( (: get_subtype :), ob);
                return;
        }
        
        ob->set_temp("pet/pet_type",  order);

        write("\n");
        write("请设定坐骑的性别(雄性：1  雌性：0)：");
        input_to( (: get_gender :), ob ); 
}

void get_gender(string arg, object ob)
{
        int gender;
        
        sscanf(arg, "%d", gender);

        if (gender != 0 && gender != 1)  
        {
                write("\n");
                write("请设定坐骑的性别(雄性：1  雌性：0)：");
                input_to( (: get_gender :), ob );
                return;
        }
        ob->set_temp("pet/pet_gender", gender ? "男性" : "女性");

        write("\n");
        write("现在你可以设定英文 id ，请注意，你设定的英文 id 会自动加上后缀坐骑种类 id。\n");
        write("比如你想设定的 id 是 biyunwulong ju，那么你只要输入 biyunwulong 就可以。\n");        
        write("请设定英文 id ：");
        input_to( (: get_id :), ob );
}

int check_legal_id(string id)
{
        int i;
//      string *legalid;
        object ppl;   
          
        i = strlen(id);
        
        if ((strlen(id) < 3) || (strlen(id) > 20)) 
        {
                write("对不起，英文 id 必须是 3 到 20 个英文字母。\n");
                return 0;
        }
        
        while(i--)
        
        if (id[i] != ' ' && (id[i] < 'a' || id[i] > 'z'))  
        {
                write("对不起，英文 id 只能用英文字母。\n");
                return 0;
        }

        ppl = LOGIN_D->find_body(id);
        
        if (ppl || id == "guest" || id == "new") 
        {
                write("这个名字与别的玩家ID相同了．．．");
                return 0;
        }

        if (file_size(sprintf("/data/user/%c/%s", id[0], id)
                    + __SAVE_EXTENSION__) >= 0) 
        {
                write("这个名字已经被别的玩家使用了．．．");
                return 0;
        } 
        /*        
        legalid = explode(read_file(BANNED_ID), "\n");
        for (i = 0; i < sizeof(legalid); i++)   
        {
                if (id == legalid[i])   
                {
                        write("对不起，这种 id 会造成其他人的困扰。\n");
                        return 0;
                }
        }
        */    
        return 1;
}

int check_legal_name(string name, int max_len)
{
        int i;
//      string  *legalname;             //not implemented..may add later
        
        i = strlen(name);
        if ((strlen(name) < 2) || (strlen(name) > max_len )) 
        {
                write(sprintf("对不起，坐骑中文字必须是 1 到 %d 个中文字。\n",
                      max_len / 2));
                return 0;
        }
        
        if (max_len < 13 && strsrch(NAME_D->who_is(name), "泥") >= 0)
        {
                write("对不起，坐骑的名字不能和玩家的名字重复。\n"); 
                return 0;
        }

        if (max_len < 13 && ! is_chinese(name))
        {
                write("对不起，请您用「中文」为坐骑取名字或描述。\n");
                return 0;
        }
        return 1; 
}


void get_id(string arg, object ob)
{
        arg = lower_case(arg);
        
        if (! check_legal_id(arg))   
        {
                write("\n");
                write("现在你可以设定英文 id ，请注意，你设定的英文 id 会自动加上后缀坐骑种类 id。\n");
                write("比如你想设定的 id 是 biyunwulong ju，那么你只要输入 biyunwulong 就可以。\n");                    
                write("请设定英文 id ：");
                input_to( (: get_id :), ob ); 
                return;
        }

        arg = replace_string(arg, " ", "_");    
        
       ob->set_temp("pet/pet_id", arg + " " + pet_id_surfix[ob->query_temp("pet/pet_type") - 1]);
        ob->set_temp("pet/pet_bz", arg);
        //ob->set_temp("pet/pet_bz", arg + " " + pet_id_surfix[ob->query_temp("pet/pet_type") - 1]);
        write("\n");
        write("现在你可以设定中文名，请注意，你设定的中文名会加上基本名。\n");
        write("比如你选择的是狮，中文名为小白，名字就会为小白狮。\n");
        write("请设定中文名：(可加颜色)");
        input_to( (: get_name :), ob);
}

void get_name(string arg, object ob)
{
        string  arg_old;
        
                
        arg_old = arg;
        /*
        arg = trans_color(arg, 1);
        arg = filter_color(arg);
        */
        arg = replace_string(arg, "$BLK$", "");
        arg = replace_string(arg, "$RED$", "");
        arg = replace_string(arg, "$GRN$", "");
        arg = replace_string(arg, "$YEL$", "");
        arg = replace_string(arg, "$BLU$", "");
        arg = replace_string(arg, "$MAG$", "");
        arg = replace_string(arg, "$CYN$", "");
        arg = replace_string(arg, "$WHT$", "");
        arg = replace_string(arg, "$HIR$", "");
        arg = replace_string(arg, "$HIG$", "");
        arg = replace_string(arg, "$HIY$", "");
        arg = replace_string(arg, "$HIB$", "");
        arg = replace_string(arg, "$HIM$", "");
        arg = replace_string(arg, "$HIC$", "");
        arg = replace_string(arg, "$HIW$", "");
        arg = replace_string(arg, "$NOR$", "");

        if (! check_legal_name(arg, 12))  
        {
                write("现在你可以设定中文名，请注意，你设定的中文名会加上基本名。\n");
                write("比如你选择的是狮，中文名为小白，名字就会为小白狮。\n");
                write("请设定中文名：(可加颜色)");
                input_to( (: get_name :), ob);
                return;
        }

        arg = arg_old;
        // arg = trans_color(arg, 1); 
        arg = replace_string(arg, "$BLK$", BLK);
        arg = replace_string(arg, "$RED$", RED);
        arg = replace_string(arg, "$GRN$", GRN);
        arg = replace_string(arg, "$YEL$", YEL);
        arg = replace_string(arg, "$BLU$", BLU);
        arg = replace_string(arg, "$MAG$", MAG);
        arg = replace_string(arg, "$CYN$", CYN);
        arg = replace_string(arg, "$WHT$", WHT);
        arg = replace_string(arg, "$HIR$", HIR);
        arg = replace_string(arg, "$HIG$", HIG);
        arg = replace_string(arg, "$HIY$", HIY);
        arg = replace_string(arg, "$HIB$", HIB);
        arg = replace_string(arg, "$HIM$", HIM);
        arg = replace_string(arg, "$HIC$", HIC);
        arg = replace_string(arg, "$HIW$", HIW);
        arg = replace_string(arg, "$NOR$", NOR);
        
        ob->set_temp("pet/pet_name", arg);
        
        write("\n");
        write("请描述坐骑：(不可加颜色)");
        input_to( (: get_desc :), ob);
}

void get_desc(string arg, object ob)
{
       
                
        if (! check_legal_name(arg, 60))  
        {
                write("请描述坐骑：(不可加颜色)");
                input_to( (: get_desc :), ob);
                return;
        }

        ob->set_temp("pet/pet_desc",  arg);
        write("ok\n");
        //报错的行号
        build_pet(ob);
}

void build_pet(object ob)
{
        string *id_list;       
        string msg;
        string fn;
        string fc;
//      int rev;
        object pet;
             
        string pet_type = ob->query_temp("pet/pet_type");
        string pet_id = ob->query_temp("pet/pet_id");
        string pet_name = ob->query_temp("pet/pet_name");
        string pet_desc = ob->query_temp("pet/pet_desc");
//      string pet_bz = ob->query_temp("pet/pet_bz");
        string bpet_name = pet_type_name[(int)pet_type - 1];     
        string pet_gender = ob->query_temp("pet/pet_gender");

        pet_name += bpet_name + NOR;
        
        id_list = ({ pet_id });
        
        fc = read_file(PET_OBJ);
        
        //报错的行号
        fc = replace_string(fc, "PET_NAME", pet_name);
        fc = replace_string(fc, "PET_ID", pet_id);                                                       
        fc = replace_string(fc, "PET_GENDER", pet_gender);
                            
        fc = replace_string(fc, "PET_UNIT",
                            pet_unit_name[(int)pet_type - 1]);
                            
        fc = replace_string(fc, "LONG_DESCRIPTION", 
                            pet_desc + "\n" + "它是" + 
                            ob->query("name") + "的坐骑。\n");
        
        fc = replace_string(fc, "OWNER_ID", ob->query("id"));
        fc = replace_string(fc, "OWNER_NAME", ob->query("name"));
                            
        fn = PET_DIR + ob->query("id") + "-" + "pet";
        
        if (file_size(fn + ".c") > 0)
        {
                if (pet = find_object(fn)) destruct(pet);
                rm(fn + ".c");
        }

        assure_file(fn);
        write_file(fn + ".c", fc); // 写入文件
        VERSION_D->append_sn(fn + ".c"); // 给物品增加识别码

        pet = load_object(fn);
        
        msg = "$N到屋后坐骑培育场牵了" + pet_name + "出来。\n" +
               "恭喜$n养了" + pet_name + "，以后$n可要好好待它。\n";
               
        message_vision(msg, this_object(), ob);    
            
        pet->move(environment(ob));
        command("say 你可以吹声口哨召唤你的坐骑！<whistle " + pet_id +">\n");
        ob->set("can_whistle/" + pet_id, fn);
        ob->delete_temp("pet");
        ob->save();
        return;
       
       
}

int accept_object(object me, object ob)
{
        command("xixi");
        command("say 呵呵，多谢这位" + RANK_D->query_respect(me) + " ！");

        if (me->query_skill("training", 1) < 100)
        {
                command("say 你的驭兽术不够，即使养了坐骑，也会离你而去！");
                return 0;
        }

        if (ob->query("money_id"))
        {
                if (ob->value() < 10000000)
                {
                        command("say 这位给的未免少了点！每只坐骑要一千两黄金！");
                        return 0;
                }
                else
                {
                        me->set_temp("pet/money",1);
                        command("say 好我收下了！");
                        command("say " + me->name() +
                                     "，现在我这里有各种可当作坐骑的动物！");
                        command("say 请选择你要的动物 < choose >");
                        destruct(ob);
                        return 1;
                }
        }
        return 0;
}
int recognize_apprentice(object me, string skill) 
{
        if (skill == "training") 
                return 1;                
        else 
                return 0;
}