package com.jhipster.demo.blog.aop.company;

import com.jhipster.demo.blog.repository.BlogRepository;
import com.jhipster.demo.blog.security.SecurityUtils;
import com.jhipster.demo.blog.repository.UserRepository;
import com.jhipster.demo.blog.domain.User;
import com.jhipster.demo.blog.domain.Blog;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.hibernate.Filter;
import java.util.Optional;
import java.util.NoSuchElementException;
import java.util.List;
import org.springframework.data.domain.Example;
import org.aspectj.lang.annotation.AfterReturning;

@Aspect
@Component
public class BlogAspect {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BlogRepository blogRepository;

    /**
     * Run method if Blog repository save is hit.
     * Adds tenant information to entity.
     */
    @Before(value = "execution(* com.jhipster.demo.blog.repository.BlogRepository.save(..)) && args(blog, ..)")
    public void onSave(JoinPoint joinPoint, Blog blog) {
        Optional<String> login = SecurityUtils.getCurrentUserLogin();

        if(login.isPresent()) {
            User loggedInUser = userRepository.findOneByLogin(login.get()).get();

            if (loggedInUser.getCompany() != null) {
                blog.setCompany(loggedInUser.getCompany());
            }
        }
    }

    /**
     * Run method if Blog repository deleteById is hit.
     * Verify if tenant owns the blog before delete.
     */
    @Before(value = "execution(* com.jhipster.demo.blog.repository.BlogRepository.deleteById(..)) && args(id, ..)")
    public void onDelete(JoinPoint joinPoint, Long id) {
        Optional<String> login = SecurityUtils.getCurrentUserLogin();

        if(login.isPresent()) {
            User loggedInUser = userRepository.findOneByLogin(login.get()).get();

            if (loggedInUser.getCompany() != null) {
                Blog blog = blogRepository.findById(id).get();
                if(blog.getCompany() != loggedInUser.getCompany()){
                    throw new NoSuchElementException();
                }
            }
        }
    }

    /**
     * Run method if Blog repository findById is returning.
     * Adds filtering to prevent display of information from another tenant.
     */
    @Around("execution(* com.jhipster.demo.blog.repository.BlogRepository.findById(..)) && args(id, ..)")
    public Object onFindById(ProceedingJoinPoint pjp, Long id) throws Throwable {
        Optional<String> login = SecurityUtils.getCurrentUserLogin();

        Optional<Blog> optional = (Optional<Blog>) pjp.proceed();
        if(login.isPresent())
        {
            User loggedInUser = userRepository.findOneByLogin(login.get()).get();

            if (loggedInUser.getCompany() != null) {
                if(optional.isPresent() && !optional.get().getCompany().equals(loggedInUser.getCompany())){
                    throw new NoSuchElementException();
                }
            }
        }
        return optional;
    }

    /**
     * Run method around Blog service findAll.
     * Adds filtering to prevent display of information from another tenant before database query (less performance hit).
     */
    @Around("execution(* com.jhipster.demo.blog.service.BlogService.findAll())")
    public Object onFindAll(ProceedingJoinPoint pjp) throws Throwable {
        Optional<String> login = SecurityUtils.getCurrentUserLogin();

        if(login.isPresent())
        {
            User loggedInUser = userRepository.findOneByLogin(login.get()).get();

            if (loggedInUser.getCompany() != null) {
                Blog example = new Blog();
                example.setCompany(loggedInUser.getCompany());
                List<Blog> blogs = blogRepository.findAll(Example.of(example));
                return blogs;
            }
        }
        return pjp.proceed();
    }
}
