package uz.multitest.app.core.di

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import uz.multitest.app.data.repository.*
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindAuthRepository(
        authRepositoryImpl: AuthRepositoryImpl
    ): AuthRepository

    @Binds
    @Singleton
    abstract fun bindTestRepository(
        testRepositoryImpl: TestRepositoryImpl
    ): TestRepository

    @Binds
    @Singleton
    abstract fun bindExamRepository(
        examRepositoryImpl: ExamRepositoryImpl
    ): ExamRepository
}
