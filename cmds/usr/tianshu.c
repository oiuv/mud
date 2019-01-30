// #pragma save_binary


//begin select xiansuo renwu wanchen status bigreward

#include <ansi.h>
inherit F_CLEAN_UP;
#define XIANSUO "/quest/"
#define XIANSUOO "/quest/"
void select(object me);
void xiansuo(object me);
void get_num(string arg,object me);
void renwu(object me);
void check_corpse(object me);
void nextstep(object me);
void check(object me);
void check_thing(object me);
void check_baohu(object me);
void baohu(object me,object vic);
void reward(int exp,object me);
void status(object me);
string wan(int i);
void bigreward(object me);
void check_song(object me);
void songwu(object me);

int main(object me, string arg)
{
//      object aaa,ob,env;
//      int i,j,j1,j2;
//      string id,name;

	if (! arg)
	{
		if (! me->query("tianshu"))
			return notify_fail("你现在没有天书的任务！\n");
        	else
		if (me->query(me->query("tianshu")))
			return notify_fail("你现在刚做完"+me->query("tianshu")+"！\n");
        	else
		{
			tell_object(me,"你目前该完成"+me->query("tianshu")+"！\n");
			return 1;
		}
	}
	if (arg=="begin")
       	{
/*
	        if (! me->query_temp("begin"))
			return 1;
*/
	        if (! me->query("tianshu"))
                {
			tell_object(me,"你开始做天书了！\n");
	                me->set("tianshu","飞狐外传");
        	        me->set("tianfile","tianshu0");
                	me->delete("xiansuo");
	                me->delete("心愿");
        	        me->delete("特殊");
                	me->delete("bu");
	                me->delete("told");
        	        return 1;
		} else
		{
                	tell_object(me,"你开始重做"+me->query("tianshu")+"了！\n");
	                me->delete(me->query("tianshu"));
        	        me->delete("xiansuo");
                	me->delete("心愿");
	                me->delete("bu");
        	        me->delete("特殊");
                	me->delete("told");
        	        return 1;
		}
        }
	if (arg == "newbegin" && me->query_temp("newbegin"))
	{
               me->delete(me->query("tianshu"));
                me->delete("xiansuo");
                me->delete("心愿");
                me->delete("told");
                me->delete("特殊");
                return 1;
	}

	if (arg=="select")
	{
		select(me);
		return 1;
	}
	if (arg=="xiansuo")
	{
		xiansuo(me);
		return 1;
	}
	if (arg=="renwu")
	{
		renwu(me);
		return 1;
	}
	if (arg=="wancheng")
	{
		check(me);
		return 1;
	}
	if (arg=="songwu")
	{
		songwu(me);
		return 1;
	}
	if (arg=="status")
	{
		status(me);
		return 1;
	}
	if (arg=="bigreward")
	{
		bigreward(me);
		return 1;
	}
	tell_object(me,"请用help tianshu看帮助文件或help exp看帮助文件。\n");
	return 1;
}

void select(object me)
{
        if (!me->query_temp("select"))
		return;

        write(" ０．飞１．雪２．连３．天４．射５．白．６．鹿
                ７．笑８．书９．神ａ．侠ｂ．倚ｃ．碧．ｄ．鸳\n");
        write("请选择（0，1，2，3．．．）：");
        input_to("get_num",me);
}

void get_num(string arg,object me)
{
        string s; 
       	if (arg == "" )
	{
                write("请选择（0，1，2，3．．．）：");
                input_to("get_num",me);
                return;
        }
        if( arg[0]=='0')
        {
		me->set("tianshu","飞狐外传");
		s="0";
	}
        else if (arg[0]=='1') {me->set("tianshu","雪山飞狐");s="1";}
        else if (arg[0]=='2') {me->set("tianshu","连城决");s="2";}
        else if (arg[0]=='3') {me->set("tianshu","天龙八部");s="3";}
        else if (arg[0]=='4') {me->set("tianshu","射雕英雄传");s="4";}
        else if (arg[0]=='5') {me->set("tianshu","白马啸西风");s="5";}
        else if (arg[0]=='6') {me->set("tianshu","鹿鼎记");s="6";}
        else if (arg[0]=='7') {me->set("tianshu","笑傲江湖");s="7";}
        else if (arg[0]=='8') {me->set("tianshu","书剑恩仇录");s="8";}
        else if (arg[0]=='9') {me->set("tianshu","神雕侠侣");s="9";}
        else if (arg[0]=='a') {me->set("tianshu","侠客行");s="a";}
        else if (arg[0]=='b') {me->set("tianshu","倚天屠龙记");s="b";}
        else if (arg[0]=='c') {me->set("tianshu","碧血剑");s="c";}
        else if (arg[0]=='d') {me->set("tianshu","鸳鸯刀");s="d";}
     	else {
               	write("对不起，您只能从（0,1,2,3．．．）中选择： ");
              	input_to("get_num",me);
                return;
        }
        tell_object(me,"你决定开始做"+me->query("tianshu")+"了。\n");
        me->delete("xiansuo");
        me->delete("心愿");
        me->delete("特殊");
        me->delete("bu");
        me->delete("told");
        me->set("tianfile","tianshu"+s);
        return;
}

void xiansuo(object me)
{
        string file, *lines, xiansuo, *words;
        object *inv, env;
        int i, j=-1;

        if (! me->query_temp("dating"))
		return;

	if (! me->query("tianshu"))
	{
		tell_object(me,"你没打听任何有关天书的消息。\n");
		return;
	}

        if (me->query(me->query("tianshu")))
	{
		tell_object(me,"你已经完成了"+me->query("tianshu")+"。"
                               "请用select另选或用begin重开。\n");
		return;
	}

	if (!me->query("tianfile"))
	{
		tell_object(me,"你没打听任何有关天书的消息。\n");
		return;
	}

	if (me->query("combat_exp") > 10000000 && ! random(4))
	{
		file=read_file(XIANSUOO+me->query("tianfile"));
        	lines=explode(file,"\n");

	        if (! me->query("xiansuo")) 
                {
               		xiansuo=lines[random(sizeof(lines))];
               		words=explode(xiansuo,"/");
               		me->set("特殊",words);
               		me->set("xiansuo",words[0]);
                }
	} else
	{
       		file=read_file(XIANSUO+"xiansuolist");
       		lines=explode(file,"\n");

       		if (!me->query("xiansuo"))
		{
			xiansuo=lines[random(sizeof(lines))];
			me->set("xiansuo",xiansuo);
        	}
	}

	env=environment(me);
	inv=all_inventory(env);
       	i=sizeof(inv);

	while(i--)
        {
       		if (inv[i]->query("name")==me->query("xiansuo")	&& !userp(inv[i]))
			j=i;
	}

	if (j<0)
	        tell_object(me,"目前似乎"+me->query("xiansuo")+"那儿有些线索。\n");
	else 
        {
       		if (me->query("told"))
		{
			tell_object(me,inv[j]->name()+"说道：我已经说过了。\n");
		} else
		{
			tell_object(me, inv[j]->name()+"说道：我知道" +
				        me->query("tianshu")+"在哪儿，"
					"你帮我完成几个任务，我再告诉你。\n");
	               	me->set_temp("giverenwu",1);
			me->set("told",1);
		}
        }               
	return;
}

void renwu(object me)
{
        string /*shu,*/tasklist,file,*lines,task,*words;
        mapping sss=(["class":"kill","name":"ren","exp":1]);
        object env,*inv,ob;
        int i,j=-1,level,size,up,down;

        if (!me->query_temp("renwu"))
		return;

	if (!me->query_temp("giverenwu")) 
	{
        	sss=me->query("心愿");
	        if (sss)
        	{
			if (sss["class"]=="kill")
				tell_object(me, "你目前任务：帮"+me->query("xiansuo")+
						"杀了"+sss["name"]+"。\n");
	                else
			if (sss["class"]=="find")
				tell_object(me, "你目前任务：帮"+me->query("xiansuo")+
						"找到"+sss["name"]+"。\n");
	                else
			if (sss["class"]=="song")
				tell_object(me, "你目前任务：帮"+me->query("xiansuo")+
						"把"+me->query("target")+"送到"+sss["name"]+"手中。\n");
	                else
			if (sss["class"]=="baohu")
				tell_object(me,"你目前任务：保护"+me->query("xiansuo")+"。\n");
       		} else
			tell_object(me,"你目前没有任务，还是先打探一下线索。\n");
	} else
	{
        	env=environment(me);
	        inv=all_inventory(env);
       		i=sizeof(inv);

	        while(i--)
       		{
        	        if (inv[i]->query("name")==me->query("xiansuo")&&!userp(inv[i]))
			j=i;
        	}

		if (j<0)
	        {
			tell_object(me,"你跟谁说话？\n");
			return;
		}

		if (me->query("特殊")) 
       	        {
        	        words=me->query("特殊");
       	        	switch(words[1])
			{
       	                case "kill":tell_object(me,me->query("xiansuo")+"说道：你帮我杀了"+words[2]+"，带其尸体来见我！\n");
                                    tell_object(me,me->query("xiansuo")+"说道："+words[3]+"\n");
                                    sss["class"]="kill";sscanf(words[4],"%d",sss["exp"]);sss["name"]=words[2];
                                    break;

        	        case "find":tell_object(me,me->query("xiansuo")+"说道：你帮我找到"+words[2]+"！\n");
                                    tell_object(me,me->query("xiansuo")+"说道："+words[3]+"\n");
                                    sss["class"]="find";sscanf(words[4],"%d",sss["exp"]);sss["name"]=words[2];
                                    break;

               	 	case "song":tell_object(me,me->query("xiansuo")+"说道：你帮我把"+words[3]+"送到"+words[2]+"手中！\n");
                                    tell_object(me,me->query("xiansuo")+"说道："+words[4]+"\n");
                                    sss["class"]="song";sscanf(words[5],"%d",sss["exp"]);sss["name"]=words[2];
                                    me->set("target",words[3]);
                                    ob=new("/obj/tianshu/wupin");
                                    ob->move(me);
                                    ob->set("name",words[3]);
                                    break;
                       	}
                	me->set("心愿",sss);
       	        	me->delete_temp("giverenwu");
               	} else
		{
			tasklist="/quest/tasklist1";
			file=read_file(tasklist);
			lines=explode(file,"\n");
			level=me->query("combat_exp")/1000000;
			size=sizeof(lines)/10;
			down=size*level*3/2;
			up=down+size;

			if (down<0)
				down=0;

			if (up>=sizeof(lines))
			{
				up=sizeof(lines);
				down=up-size;
			}

			if (!random(5))
			{
				task = lines[random(up)];
			} else
				task = lines[down+random(size)];

			if (sscanf(task,"%s/%s/%d",sss["class"],sss["name"],sss["exp"])!=3)
				return;

			me->set("心愿",sss);

			if (sss["class"]=="kill")
				tell_object(me, me->query("xiansuo")+
                                                "说道：你帮我杀了"+sss["name"]+
                                                "，带其尸体来见我！\n");
			else
			if (sss["class"]=="find")
				tell_object(me, me->query("xiansuo")+"说道：你帮"
						"我找到"+sss["name"]+"！\n");
			else
			if (sss["class"]=="baohu")
			{
				tell_object(me, me->query("xiansuo")+"说道：有人"
						"要对付我，你留在这里保护我！\n");
				call_out("baohu",10,me,inv[j]);
			}
			me->delete_temp("giverenwu");
		}
	}

	if (me->query("wancheng"))
		tell_object(me,"你任务完成了，没去交差吗？\n");
}

void check_corpse(object me)
{
        object *inv,env;int i,j=-1;
        mapping renwu;
        renwu=me->query("心愿");
        env=environment(me);
        inv=all_inventory(env);
        i=sizeof(inv);

        while(i--)
        {
                if (inv[i]->query("name") == me->query("xiansuo") && ! userp(inv[i]))
			j=i;
        }

	if (j<0)
        {
		tell_object(me,"你跟谁说话？\n");
			return;
	}
        j=-1;

        inv=all_inventory(me);
        i=sizeof(inv);

        while(i--)
        {
                if (inv[i]->query("name")==(me->query("心愿"))["name"]+"的尸体")
			j=i;
        }

        if (j>=0)
	{
		tell_object(me, me->query("xiansuo")+"说道：很好！你已经帮我杀了"+
				(me->query("心愿"))["name"]+"。\n");
                destruct(inv[j]);

                if (me->query("bu"))
			me->add("bu",1);
                else
			me->set("bu",1);
                reward(renwu["exp"],me);
                me->delete("心愿");
                me->delete("特殊");
                nextstep(me);
        } else
	{
                tell_object(me, me->query("xiansuo")+"说道：我要你帮我杀了"+
                                (me->query("心愿"))["name"]+"。你还没完成！\n");
	}
}

void nextstep(object me)
{
        int exp;
        string file,*lines,xiansuo,*words;
        object ob;
        if (me->query("bu")>=random(3)+9) 
                {
me->set("end_time",time());
                tell_object(me,me->query("xiansuo")+"说道：我这儿有一本旧书，对你可能有用，这就给你吧。\n");
                me->set(me->query("tianshu"),1);
if (me->query(me->query("tianshu")+"s")) me->add(me->query("tianshu")+"s",1);
                        else me->set(me->query("tianshu")+"s",1);
                me->delete("xiansuo");
                me->delete("特殊");
                me->delete("心愿");
                me->delete("bu");
                me->delete("told");
exp=400 + me->query("combat_exp")/3000+random(me->query("combat_exp")/3000);
if (exp<300) exp=300;
reward(exp,me);         
                ob=new("/obj/tianshu/"+me->query("tianfile"));
                ob->set("endname",me);
                ob->move(me);
}       
                else {
if (me->query("combat_exp")>10000000&&!random(4))
//if (me->query("combat_exp")<2000000)
switch(random(1)){
case 0: file=read_file(XIANSUOO+me->query("tianfile"));
        lines=explode(file,"\n");
                xiansuo=lines[random(sizeof(lines))];
                words=explode(xiansuo,"/");
                me->set("特殊",words);
                me->set("xiansuo",words[0]);
        break;
                }
else{
        file=read_file(XIANSUO+"xiansuolist");
        lines=explode(file,"\n");
        xiansuo=lines[random(sizeof(lines))];
        me->set("xiansuo",xiansuo);
        }
        tell_object(me,"你去找"+me->query("xiansuo")+"问问，看看有没有什么消息。\n");
        me->delete("told");
                        }
}
void check(object me)
{       
        mapping renwu;
        if (!me->query_temp("jiaochai")) return;
if (!me->query("心愿")) {tell_object(me,"你目前并无任务，你还是先找找线索。\n");return;}
renwu=me->query("心愿");
if (renwu["class"]=="kill") check_corpse(me);
        else if (renwu["class"]=="find") check_thing(me);
        else if (renwu["class"]=="song") check_song(me);
        else if (renwu["class"]=="baohu") check_baohu(me);
}
void check_thing(object me)
{
        object *inv,env;int i,j=-1;
        mapping renwu;
        renwu=me->query("心愿");
        env=environment(me);
        inv=all_inventory(env);
        i=sizeof(inv);
        while(i--)
        {

                if (inv[i]->query("name")==me->query("xiansuo")&&!userp(inv[i])) j=i;
        }
if (j<0)        {tell_object(me,"你跟谁说话？\n");return;}
        j=-1;
        inv=all_inventory(me);
        i=sizeof(inv);
        while(i--)
        {
                if (inv[i]->query("name")==(me->query("心愿"))["name"]) j=i;
        }
        if (j>=0) {tell_object(me,me->query("xiansuo")+"说道：很好！你已经帮我找到"+(me->query("心愿"))["name"]+"了。\n");
                        destruct(inv[j]);
                if (me->query("bu")) me->add("bu",1);
                                else me->set("bu",1);
                        me->delete("心愿");
                        me->delete("特殊");
                        reward(renwu["exp"],me);
                        nextstep(me);
                        }
        else {
                tell_object(me,me->query("xiansuo")+"说道：我要你帮我找到"+(me->query("心愿"))["name"]+"。你还没完成！
\n");
}
}
void baohu(object me,object vic)
{
object obj;
me->set("baohuren",me->query("xiansuo"));
obj->move(environment(me));
obj->set("kill",me->query("xiansuo"));
message_vision("$N走了进来，冷冷地看着$n。\n",obj,vic);
message_vision("$N对$n喝道：找了你这许久，原来你躲在这里。去死吧！\n",obj,vic);
obj->set("combat_exp",me->query("combat_exp")+random(1000000));
vic->set("kee",3000);
obj->kill_ob(vic);
me->kill_ob(obj);
vic->kill_ob(obj);
obj->check();
}
void check_baohu(object me)
{
        object *inv,env;int i,j=-1;
        mapping renwu;
        renwu=me->query("心愿");
        env=environment(me);
        inv=all_inventory(env);
        i=sizeof(inv);
        while(i--)
        {
                if (inv[i]->query("name")==me->query("xiansuo")&&!userp(inv[i])) j=i;
        }
if (j<0)        {tell_object(me,"你跟谁说话？\n");return;}
if (me->query("baohuren")) {tell_object(me,me->query("xiansuo")+"说道：我要你保护我。你还没完成！\n");return;}
if (!me->query("baohu")) {tell_object(me,me->query("xiansuo")+"说道：我要你保护我。你完成了吗？\n");return;}
        else {tell_object(me,me->query("xiansuo")+"说道：很好！你已经保护过我。\n");
                        me->delete("baohu");
                if (me->query("bu")) me->add("bu",1);
                                else me->set("bu",1);
                        me->delete("心愿");
                        me->delete("特殊");
                        reward(renwu["exp"],me);
                        nextstep(me);
                        }
}
void check_song(object me)
{
        object *inv,env;int i,j=-1;
        mapping renwu;
        renwu=me->query("心愿");
        env=environment(me);
        inv=all_inventory(env);
        i=sizeof(inv);
        while(i--)
        {
                if (inv[i]->query("name")==me->query("xiansuo")&&!userp(inv[i])) j=i;
        }
if (j<0)        {tell_object(me,"你跟谁说话？\n");return;}
if (!me->query("wancheng")) {tell_object(me,me->query("xiansuo")+"说道：我要你给我送东西。你完成了吗？\n");return;}
        else {tell_object(me,me->query("xiansuo")+"说道：很好！你已经完成任务了。\n");
                        me->delete("wancheng");
                if (me->query("bu")) me->add("bu",1);
                                else me->set("bu",1);
                        me->delete("心愿");
                        me->delete("特殊");
                        reward(renwu["exp"],me);
                        nextstep(me);
                        }
}
void songwu(object me)
{
        object env,*inv,wu;
        int i,j;
        mapping renwu;
        if (!me->query_temp("song")) return;
        env=environment(me);
        inv=all_inventory(env);
        renwu=me->query("心愿");
        if (!renwu) {tell_object(me,"你目前没有任务！\n");return;}
        i=sizeof(inv);
        j=-1;
        while(i--)
        {
                if (inv[i]->query("name")==renwu["name"]&&!userp(inv[i])) j=i;
        }
if (j<0)        {tell_object(me,"你应该把"+me->query("target")+"送给"+renwu["name"]+"\n");return;}
        wu=present("wu pin",me);
if (!wu) {
        tell_object(me,"你把东西弄到哪儿去了？\n");return;
}
        if (wu->query("name")==me->query("target")) 
        {
        tell_object(me,renwu["name"]+"笑了笑，说到：谢谢你！\n");
        tell_object(me,"你的任务完成了，回去交差吧。\n");
        me->set("wancheng",1);
        destruct(wu);
        return;
        }
        else {tell_object(me,renwu["name"]+"皱了皱眉说道：这个，不对吧。\n");return;
}
}
void reward(int exp,object me)
{
    int pot,score;
if(exp>300){
     exp = 600+to_int(sqrt(to_float(me->query("combat_exp"))))+random(1500);
    score = 15+random(30);
    pot = exp/8;
    me->add("combat_exp",exp);
    me->add("potential",pot);
    me->add("score",score);
    tell_object(me,HIW"你被奖励了：\n" +
        chinese_number(exp) + "点实战经验\n"+
        chinese_number(pot) + "点潜能\n"+ 
        chinese_number(score) + "点评价\n"NOR);
}
else{
                exp=exp*me->query_kar()/20;
                exp+=random(exp);
                pot=exp/8;
                me->add("combat_exp",exp);
                me->add("potential",pot);
                tell_object(me,HIW"你被奖励了：\n" +
                chinese_number(exp) + "点实战经验\n"+
                chinese_number(pot) + "点潜能\n"NOR);
}
}
void status(object me)
{
        string line;
        if (!me->query_temp("status")) return;
        line = sprintf( BOLD "\n%s" NOR "%s\n", RANK_D->query_rank(me), me->short(1) );
        line += sprintf(" 飞狐外传：\t%s\t\t笑傲江湖：\t%s\n"
                        " 雪山飞狐：\t%s\t\t书剑恩仇录：\t%s\n"
                        " 连城决：\t%s\t\t神雕侠侣：\t%s\n"
                        " 天龙八部：\t%s\t\t侠客行：\t%s\n"
                        " 射雕英雄传：\t%s\t\t倚天屠龙记：\t%s\n"
                        " 白马啸西风：\t%s\t\t碧血剑：\t%s\n"
                        " 鹿鼎记：\t%s\t\t鸳鸯刀：\t%s\n",
                        wan(me->query("飞狐外传")),     
                        wan(me->query("笑傲江湖")),     
                        wan(me->query("雪山飞狐")),     
                        wan(me->query("书剑恩仇录")),   
                        wan(me->query("连城决")),       
                        wan(me->query("神雕侠侣")),     
                        wan(me->query("天龙八部")),     
                        wan(me->query("侠客行")),       
                        wan(me->query("射雕英雄传")),   
                        wan(me->query("倚天屠龙记")),   
                        wan(me->query("白马啸西风")),   
                        wan(me->query("碧血剑")),       
                        wan(me->query("鹿鼎记")),       
                        wan(me->query("鸳鸯刀")));
        write(line);
        return;
}

string wan(int i)
{
	if (i)
		return HIY"已完成"NOR ;
	else
		return "未完成";
}
void bigreward(object me)
{
        object obj;
        if (me->query("飞狐外传")&&
        me->query("笑傲江湖")&&
        me->query("雪山飞狐")&& 
        me->query("书剑恩仇录")&&
        me->query("连城决")&&
        me->query("神雕侠侣")&&
        me->query("天龙八部")&&
        me->query("侠客行")&&
        me->query("射雕英雄传")&&
        me->query("倚天屠龙记")&&
        me->query("白马啸西风")&&
        me->query("碧血剑")&&
        me->query("鹿鼎记")&&
        me->query("鸳鸯刀")) 
                {
                obj=new("/obj/tianshu/hongbao");
                obj->move(me);
                obj->set("endname",me);
                tell_object(me,HIY"你得到一个额外奖励。\n"NOR);
        me->delete("飞狐外传");
        me->delete("笑傲江湖");
        me->delete("雪山飞狐"); 
        me->delete("书剑恩仇录");
        me->delete("连城决");
        me->delete("神雕侠侣");
        me->delete("天龙八部");
        me->delete("侠客行");
        me->delete("射雕英雄传");
        me->delete("倚天屠龙记");
        me->delete("白马啸西风");
        me->delete("碧血剑");
        me->delete("鹿鼎记");
        me->delete("鸳鸯刀"); 
        me->set_temp("bigreward",1);
                }
}
int help(object me)
{
  this_player()->start_more(@HELP
天书命令有三种格式：tianshu 、tianshu begin 、tianshu select 
相关指令：dating 打听、renwu 任务、jiaochai 交差、status 状态
更详细的使用见下面天书任务的过程：
> ask nanxian about tianshu
你向南贤打听有关『tianshu』的消息。
南贤说道：你想找天书？请用select选择你想要找的天书，然后(accept)
> select

                ０．飞１．雪２．连３．天４．射５．白．６．鹿
                ７．笑８．书９．神ａ．侠ｂ．倚ｃ．碧．ｄ．鸳
                
请选择（0，1，2，3．．．）：1
你决定开始做雪山飞狐了。
> accept
南贤说道：你已经完成了雪山飞狐。请用select另选或用begin重开。
> begin
你开始重做雪山飞狐了！
> accept
南贤说道：目前似乎南千王那儿有些线索。
> dating
南千王说道：我知道雪山飞狐在哪儿，你帮我完成几个任务，我再告诉你。
> renwu
南千王说道：有人要对付我，你留在这里保护我！
> 神秘人走了进来，冷冷地看着南千王。
神秘人对南千王喝道：找了你这许久，原来你躲在这里。去死吧！
神秘人死了。
> jiaochai
南千王说道：很好！你已经保护过我。
你被奖励了：
五十点实战经验
八点潜能
你去找门卫问问，看看有没有什么消息。
> dating
门卫说道：我知道雪山飞狐在哪儿，你帮我完成几个任务，我再告诉你。
> renwu
门卫说道：你帮我找到单刀！
> jiaochai
门卫说道：很好！你已经帮我找到单刀了。
你被奖励了：
五十点实战经验

八点潜能
你去找张龙问问，看看有没有什么消息。
> dating
张龙说道：我知道雪山飞狐在哪儿，你帮我完成几个任务，我再告诉你。
> renwu
张龙说道：你帮我杀了货郎，带其尸体来见我！
...
货郎死了。
> get corpse
你将货郎的尸体扶了起来背在背上。
> jiaochai
张龙说道：很好！你已经帮我杀了货郎。
你被奖励了：
五十点实战经验
八点潜能
你去找门卫问问，看看有没有什么消息。
......
小姑娘说道：很好！你已经保护过我。
你被奖励了：
五十点实战经验
八点潜能
小姑娘说道：我这儿有一本旧书，对你可能有用，这就给你吧。
你被奖励了：
三千七百六十一点实战经验
六百二十六点潜能
三十二点评价
> l book
《雪山飞狐》--一本流传已久的书，疑为神仙所著。
> give book to nanxian
南贤愉快地笑了笑。
南贤说道：多谢这位姑娘，您好心一定会有好报的！
你被奖励了：
四千七百四十四点实战经验
七百九十点潜能
十三点评价
你拿出天书(Book)给南贤。
> status

【 天下英杰 】红花会弟子「不要问我，我什么都不知道！！」江堤柳(Diliu)
 飞狐外传：     未完成          笑傲江湖：      未完成
 雪山飞狐：     已完成          书剑恩仇录：    未完成
 连城决：       已完成          神雕侠侣：      未完成
 天龙八部：     已完成          侠客行：        未完成
 射雕英雄传：   未完成          倚天屠龙记：    未完成
 白马啸西风：   未完成          碧血剑：        已完成
 鹿鼎记：       已完成          鸳鸯刀：        未完成
可以查看你已经完成的所有天书状况
> tianshu
你现在刚做完雪山飞狐！
> begin
你开始重做雪山飞狐了！
> tianshu
你目前该完成雪山飞狐！
> ask nanxian about tianshu
你向南贤打听有关『tianshu』的消息。
南贤说道：你想找天书？请用select选择你想要找的天书，然后(accept)
再去找南贤打听
HELP
    );
    return 1;
}